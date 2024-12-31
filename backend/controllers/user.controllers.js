import User from  '../models/User.model.js'
import Notification from '../models/notification.model.js'
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';

export const getProfile = async (req, res) => {
  try {
    const {username}=req.params;
    const user=await User.findOne({username});
    
    if(!user){
        return res.status(400).json({error:"User not found"})

    }

    res.status(200).json(user);

  } catch (e) {
    console.log(`Error from get Profile controllers ${e}`);
    res.status(400).json({ error: "Error from the internal srever" });
  }
};

export const followUnFollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers=async(req,res)=>{
  try{

    const UserId=req.user._id;
    const UserFollowedByMe =await User.findById({_id:UserId}).select("-password")
    const users=await User.aggregate([
      {
        $match:{
          _id:{$ne:UserId}
        }
      },{
        $sample:{
          size:10
        }
      }
    ])

    const filteredUsers =users.filter((user)=>!UserFollowedByMe.following.includes(user._id))
    const suggestedUsers=filteredUsers.slice(0,4);

    suggestedUsers.forEach((users)=>(users.password=null)) 
    res.status(200).json(suggestedUsers)

  }catch(e){
    console.log(`Error in the Suggested User Controller${e}`);
    res.status(400).json({error:"Internal Server Error "})
  }

}

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, fullName, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    let user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(400).json({ error: "User not Found" });
    }

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Please Provide Both the Passwords" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current Password Is Incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password length must be greater than 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
  

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // Remove password before sending the response
    user.password = null;
    return res.status(200).json(user);
  } catch (e) {
    console.error(`Error in the Update User controller: ${e}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
