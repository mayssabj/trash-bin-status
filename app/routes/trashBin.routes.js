module.exports = (app) => {
    const trashBins = require('../controllers/trashBin.controller.js');
  
    // Create a new TrashBin
    app.post('/api/trash-data', trashBins.create);
  
    // Retrieve all TrashBins
    app.get('/api/trash-status', trashBins.findAll);
  
    // Retrieve all Notifications (dummy endpoint for now)
    app.get('/api/notifications', (req, res) => {
      res.send([
        { message: 'Trash bin A123 is 75% full' },
        { message: 'Trash bin B456 is 80% full' }
      ]);
    });
  };
  