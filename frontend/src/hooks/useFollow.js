import toast from "react-hot-toast";
import { base_URL } from "../contant/url";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: follow, isPending } = useMutation({
		mutationFn: async (userId) => {
			try {
				const res = await fetch(`${base_URL}/api/users/follow/${userId}`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message || "An error occurred");
		},
	});

	return { follow, isPending };
};

export default useFollow;
