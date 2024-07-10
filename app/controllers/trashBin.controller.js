const TrashBin = require('../models/trashBin.model.js');
const nodemailer = require('nodemailer');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'maissabenjoud@gmail.com',
    pass: 'xeks olsd apip lulo'
  }
});

exports.create = (req, res) => {
  const { reference, longitude, latitude, height, fillLevel } = req.body;
  const trashBin = new TrashBin({ reference, longitude, latitude, height, fillLevel });

  trashBin.save()
    .then(data => {
      if (fillLevel > 70) {
        const mailOptions = {
          from: 'maissabenjoud@gmail.com',
          to: 'meryambenjoud@gmail.com',
          subject: 'Trash Bin Full Alert',
          text: `The trash bin located at longitude: ${longitude}, latitude: ${latitude} is ${fillLevel}% full.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).send({ message: 'Error sending email' });
          }
          console.log('Email sent: ' + info.response);
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
};

exports.findAll = (req, res) => {
  TrashBin.find()
    .then(trashBins => {
      res.send(trashBins);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving trash bin data."
      });
    });
};
