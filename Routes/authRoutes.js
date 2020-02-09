const { imageRoutes } = require('./imageRoutes');
const { graphDataRoutes } = require('./graphDataRoutes');
const { realTimeFaceDataRoutes } = require('./realTimeFaceData');
var routes = (app) => {
    imageRoutes(app);
    graphDataRoutes(app);
    realTimeFaceDataRoutes(app);
}
module.exports = {
    routes
}
