const TrashBin = require('../models/trashBin.model.js');
const Notification = require('../models/notification.model.js');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'maissabenjoud@gmail.com',
    pass: 'xeks olsd apip lulo'
  }
});

// Function to get address from coordinates using Nominatim API
async function getAddressFromCoordinates(latitude, longitude) {
  const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
  return response.data.display_name;
}

// Create a new TrashBin
exports.create = async (req, res) => {
  const { reference, longitude, latitude, height, fillLevel } = req.body;

  try {
    const address = await getAddressFromCoordinates(latitude, longitude);

    const trashBin = new TrashBin({
      reference,
      longitude,
      latitude,
      height,
      fillLevel,
      address
    });

    const data = await trashBin.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).send({
      message: "Error creating trash bin or getting address from coordinates."
    });
  }
};

// Update an existing TrashBin
exports.update = async (req, res) => {
  const { reference } = req.params;
  const { longitude, latitude, height, fillLevel } = req.body;

  try {
    const address = await getAddressFromCoordinates(latitude, longitude);

    TrashBin.findOneAndUpdate(
      { reference },
      { longitude, latitude, height, fillLevel, address, updatedAt: Date.now() },
      { new: true }
    )
    .then(data => {
      if (fillLevel > 70) {
        const mailOptions = {
          from: 'maissabenjoud@gmail.com',
          to: 'meryambenjoud@gmail.com',
          subject: 'Trash Bin Full Alert',
          text: `The trash bin located at longitude: ${longitude}, latitude: ${latitude} (${address}) is ${fillLevel}% full.\n\nView more: http://localhost:3000/bin/${reference}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).send({ message: 'Error sending email' });
          }

          // Save notification
          const notification = new Notification({
            message: `Email sent for trash bin ${reference} at ${fillLevel}% fill level.`,
            reference
          });
          notification.save()
            .then(() => console.log('Notification saved to MongoDB'))
            .catch(err => console.log('Failed to save notification', err));

          res.send({ message: 'Data updated and email sent', data });
        });
      } else {
        res.send({ message: 'Data updated', data });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while updating the trash bin data."
      });
    });
  } catch (error) {
    res.status(500).send({
      message: "Error getting address from coordinates."
    });
  }
};

// Retrieve all TrashBins (limit to 3)
exports.findAll = (req, res) => {
  TrashBin.find().sort({ updatedAt: -1 }).limit(3)
    .then(trashBins => {
      res.send(trashBins);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving trash bin data."
      });
    });
};

// Retrieve a specific TrashBin by reference
exports.findOne = (req, res) => {
  const { reference } = req.params;
  TrashBin.findOne({ reference })
    .then(trashBin => {
      if (!trashBin) {
        return res.status(404).send({
          message: `TrashBin not found with reference ${reference}`
        });
      }
      res.json(trashBin);
    })
    .catch(err => res.status(500).send({
      message: err.message || `Could not retrieve TrashBin with reference ${reference}`
    }));
};


// Delete a TrashBin and corresponding notifications
exports.delete = (req, res) => {
  const { reference } = req.params;

  TrashBin.findOneAndRemove({ reference })
    .then(trashBin => {
      if (!trashBin) {
        return res.status(404).send({
          message: `TrashBin not found with reference ${reference}`
        });
      }

      // Delete corresponding notifications
      Notification.deleteMany({ reference })
        .then(() => res.send({ message: 'TrashBin and corresponding notifications deleted successfully!' }))
        .catch(err => res.status(500).send({
          message: err.message || `Could not delete notifications for reference ${reference}`
        }));
    })
    .catch(err => res.status(500).send({
      message: err.message || `Could not delete TrashBin with reference ${reference}`
    }));
};
