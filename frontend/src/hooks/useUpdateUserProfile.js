import toast from "react-hot-toast";
import { base_URL } from "../contant/url";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
        mutationFn: async (formData) => {
            try {
                const res = await fetch(`${base_URL}/api/users/update`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData), // Directly pass formData
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Something Went Wrong");
                }

                return data; // Return the data for additional processing if needed
            } catch (error) {
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Updated Successfully");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return { updateProfile, isUpdating };
};

export default useUpdateUserProfile;
