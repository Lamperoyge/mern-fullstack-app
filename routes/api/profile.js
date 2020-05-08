const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ProfileModel = require("../../models/Profile");
const UserModel = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const request = require("request");
const config = require("config");
/**
 * @route GET api/profile/me
 * @desc get current user'sprofile
 * @access private
 */
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({
        msg: "There is no profile for this user",
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route POST api/profile
 * @desc create or update user's profile
 * @access private
 */
router.post(
  "/",
  auth,
  [
    check("status", "Status is required").notEmpty(),
    check("skills", "Skills is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills
        .split(",")
        .map((skill, idx) => skill.trim());
    }

    //Build social object

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await ProfileModel.findOne({ user: req.user.id });
      if (profile) {
        //Update
        profile = await ProfileModel.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      } else {
        profile = new ProfileModel(profileFields);
        await profile.save();
        return res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  }
);

/**
 * @route GET api/profile
 * @desc get all profile
 * @access Public
 */

router.get("/", async (req, res) => {
  try {
    const profiles = await ProfileModel.find().populate("user", [
      "name",
      "avatar",
    ]);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route GET api/profile/:user_id
 * @desc get profile by user id
 * @access Public
 */

router.get("/user/:user_id", [], async (req, res) => {
  try {
    const profile = await (
      await ProfileModel.findOne({ user: req.params.user_id })
    ).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @route DELETE api/profile
 * @desc delete user profile
 * @access private
 */

router.delete("/", auth, async (req, res) => {
  try {
    //Remove profile
    //TODO remove user posts
    await ProfileModel.findOneAndRemove({ user: req.user.id });
    await UserModel.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User successfully deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route PUT api/profile/experience
 * @desc Add profile experience
 * @access private
 */

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").notEmpty(),
      check("company", "Company is required").notEmpty(),
      check("from", "From date is required").notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await ProfileModel.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Server error");
    }
  }
);

/**
 * @route DELETE api/profile/experience/experience_id
 * @desc Delete experience from profile
 * @access private
 */

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    //Remove profile
    //TODO remove user posts
    const profile = await ProfileModel.findOne({ user: req.user.id });

    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );
    profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route PUT api/profile/education
 * @desc Add profile education
 * @access private
 */

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").notEmpty(),
      check("degree", "Degree is required").notEmpty(),
      check("fieldofstudy", "Field of study is required").notEmpty(),
      check("from", "From date is required").notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await ProfileModel.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Server error");
    }
  }
);
/**
 * @route DELETE api/profile/education/education_id
 * @desc Delete education from profile
 * @access private
 */

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    //Remove profile
    //TODO remove user posts
    const profile = await ProfileModel.findOne({ user: req.user.id });

    profile.education = profile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route GET api/profile/github/:username
 * @desc Get user repos from github
 * @access public
 */

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error.message);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;
