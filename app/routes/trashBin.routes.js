const trashBins = require('../controllers/trashBin.controller.js');
const Notification = require('../models/notification.model.js');
const TrashBin = require('../models/trashBin.model.js'); 
const path = require('path');

module.exports = (app) => {
    // Create or update a TrashBin
    app.post('/api/trash-data', trashBins.createOrUpdate);

    // Retrieve all TrashBins (limit to 3)
    app.get('/api/trash-data', trashBins.findAll);

    // Retrieve all Notifications
    app.get('/api/notifications', (req, res) => {
        Notification.find().sort({ timestamp: -1 }).then(notifications => {
            res.json(notifications);
        }).catch(err => res.status(500).send('Failed to retrieve notifications'));
    });

    // Retrieve specific TrashBin and render HTML page
    app.get('/bin/:reference', (req, res) => {
        res.sendFile(path.join(__dirname, '../../views/bin-details.html')); 
    });

    app.get('/api/trash-data/:reference', trashBins.findOne);

    // Delete a TrashBin and corresponding notifications
    app.delete('/api/trash-data/:reference', trashBins.delete);
};
