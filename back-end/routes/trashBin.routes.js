const trashBins = require('../controllers/trashBin.controller.js');
const Notification = require('../models/notification.model.js');
const TrashBin = require('../models/trashBin.model.js'); 
const path = require('path');

module.exports = (app) => {
     // Create a new TrashBin
     app.post('/trash-data', trashBins.create);

     // Update an existing TrashBin
     app.put('/trash-data/:reference', trashBins.update);

    // Retrieve all TrashBins (limit to 3)
    app.get('/trash-data', trashBins.findAll);

    // Retrieve all Notifications
    app.get('/notifications', (req, res) => {
        Notification.find().sort({ timestamp: -1 }).then(notifications => {
            res.json(notifications);
        }).catch(err => res.status(500).send('Failed to retrieve notifications'));
    });

    // Retrieve specific TrashBin and render HTML page
    app.get('/bin/:reference', (req, res) => {
        res.sendFile(path.join(__dirname, '../../front-end/public/bin-details.html')); 
    });
    
    app.get('/trash-data/:reference', trashBins.findOne);

    // Delete a TrashBin and corresponding notifications
    app.delete('/trash-data/:reference', trashBins.delete);
};
