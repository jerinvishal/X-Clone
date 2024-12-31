import User from '../models/User.model.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js';

export const signup=async (req,res)=>{
    try{
        const {username,fullName , email, password }=req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)){
            res.status(400).json({error:"Invalid Email Format"})
        }

        const ExistingUser=await User.findOne({email})
        const ExitingUsername=await User.findOne({username})

        if(ExistingUser || ExitingUsername){
            return res.status(400).json({error:"Already Exising Email or Username"})
        }

        if(password.length <6){
            return res.status(400).json({error:"Password must contain atleast be in the length of 6 "})
        }


        const salt=await bcrypt.genSalt(10);

        const hashedPassword=await bcrypt.hash(password,salt)



        const newUser =new User({
            username,
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save();
            res.status(200).json({
                _id:newUser._id,
                username:newUser.username,
                fullName:newUser.fullName,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg,
                bio:newUser.bio,
                link:newUser.link
            })

        }else{
            res.status(400).json({error:"Invalid User Data"})
        }

    }catch(e){
        console.log(`Error in SignUp Controller ${e}`);
        res.status(500).json({error:`Internal Server Error `})
    }
}
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateToken(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: User not authenticated" });
        }
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (e) {
        console.error(`Error in getMe Controller: ${e.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
