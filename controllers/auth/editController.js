const User = require('../../models/user');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Store images in 'public/uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});
const upload = multer({ storage: storage }).single('image');

module.exports.register = async (req, res) => {
  try {
    if (req.session.login) {
      return res.redirect(`/${user.role}/index`);
    }
    res.render("register", {
      site_title: SITE_TITLE,
      title: "Register",
      session: req.session,
      messages: req.flash(),
      currentUrl: req.originalUrl,
      userLogin: null, // No need to fetch the user if not logged in
      req: req,
      error: null,
    });
  } catch (error) {
    console.error("Error rendering register page:", error);
    return res.status(500).render("500");
  }
};


module.exports.getUserInfo = async (req, res) => {
    console.log("Session Data:", req.session); // Debugging
  
    if (!req.session.login) { // Change from `userId` to `login`
      return res.status(401).json({ message: "User not logged in" });
    }
  
    try {
      const user = await User.findById(req.session.login); // Change from `userId` to `login`
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
  // Update User Info
module.exports.updateUserInfo = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: 'File upload error' });
    }

    try {
      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);
      console.log("Session UserID:", req.session.userId);

      if (!req.session.userId) {
        return res.status(401).json({ message: "User not logged in" });
      }

      const { firstName, lastName, phoneNumber, password } = req.body;
      const user = await User.findById(req.session.userId);

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update fields only if new values are provided
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      // Update profile picture if a file is uploaded
      if (req.file) {
        user.profilePicture = '/public/uploads/' + req.file.filename;
      }

      // Hash and update password if provided
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();
      console.log("Updated User:", user);

      res.json({ success: true, message: 'Profile updated successfully!' });

    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};