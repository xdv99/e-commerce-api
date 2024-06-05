const UserModel = require("../models/user");
require("dotenv").config();

exports.getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id, {
      __v: 0,
      role: 0,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, address, lng, lat } = req.body;

  const user = await UserModel.findById(req.user.id, {
    __v: 0,
    role: 0,
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (name) {
    user.name = name;
  }

  if (address && lng && lat) {
    try {
      user.location = {
        address,
        gps: { lng, lat },
      };
      // Use Mapbox Api to get distance and duration
      const baseUrl = "https://api.mapbox.com/directions/v5/mapbox/driving";
      const storeLocation = `${process.env.STORE_LNG},${process.env.STORE_LAT}`;
      const userLocation = `${lng},${lat}`;
      const queryParams = new URLSearchParams({
        alternatives: true,
        geometries: "geojson",
        language: "en",
        overview: "full",
        access_token: process.env.MAPBOX_PUBLIC_KEY,
      });
      await fetch(`${baseUrl}/${storeLocation};${userLocation}?${queryParams}`)
        .then((res) => res.json())
        .then((data) => {
          user.location.distance = (data.routes[0].distance / 1000).toFixed(2);
          user.location.duration = parseInt(data.routes[0].duration / 60);
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Getting distance and duration failed" });
    }
  }

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
