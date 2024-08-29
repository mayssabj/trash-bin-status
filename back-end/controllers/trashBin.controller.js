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

exports.createOrUpdate = async (req, res) => {
  const { reference, longitude, latitude, height, fillLevel } = req.body;

  try {
    const address = await getAddressFromCoordinates(latitude, longitude);

    TrashBin.findOneAndUpdate(
      { reference: reference },
      { longitude, latitude, height, fillLevel, address, updatedAt: Date.now() },
      { new: true, upsert: true }  // Create if not exist, return new doc after update
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
          console.log('Email sent: ' + info.response);

          // Create and save a new notification
          const notification = new Notification({
            message: `Email sent for trash bin ${reference} at ${fillLevel}% fill level.`,
            reference: reference
          });
          notification.save()
            .then(() => console.log('Notification saved to MongoDB'))
            .catch(err => console.log('Failed to save notification to MongoDB', err));

          res.send({ message: 'Data received and email sent', data });
        });
      } else {
        res.send({ message: 'Data received', data });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while saving the trash bin data."
      });
    });
  } catch (error) {
    res.status(500).send({
      message: "Error getting address from coordinates."
    });
  }
};

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

exports.delete = (req, res) => {
  const { reference } = req.params;

  TrashBin.findOneAndRemove({ reference: reference })
    .then(trashBin => {
      if (!trashBin) {
        return res.status(404).send({
          message: `TrashBin not found with reference ${reference}`
        });
      }

      // Delete corresponding notifications
      Notification.deleteMany({ reference: reference })
        .then(() => res.send({ message: 'TrashBin and corresponding notifications deleted successfully!' }))
        .catch(err => res.status(500).send({
          message: err.message || `Could not delete notifications for reference ${reference}`
        }));
    })
    .catch(err => res.status(500).send({
      message: err.message || `Could not delete TrashBin with reference ${reference}`
    }));
};

exports.findOne = (req, res) => {
  const { reference } = req.params;
  TrashBin.findOne({ reference: reference })
    .then(trashBin => {
      if (!trashBin) {
        return res.status(404).send({
          message: `TrashBin not found with reference ${reference}`
        });
      }
      console.log('TrashBin found:', trashBin); // Log found trash bin for debugging
      res.json(trashBin);
    })
    .catch(err => res.status(500).send({
      message: err.message || `Could not retrieve TrashBin with reference ${reference}`
    }));
};
