const { RESTDataSource } = require('apollo-datasource-rest');

// The RESTDataSource class automatically caches responses from
// REST resources with no additional setup. We call this feature partial query caching.

class LaunchAPI extends RESTDataSource {
  constructor({ store }) {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
    this.store = store;
  }

  async getAllLaunches() {
    const resp = await this.get('launches');
    return Array.isArray(resp) ? resp.map((launch) => this.launchReducer(launch)) : [];
  }

  // isBooked field will be populated by our other data source, which connects to a SQLite database.
  // isBooked field is populated in resolver for Launch Default Query
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }

  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    const mappedLaunch = this.launchReducer(response[0]);
    return mappedLaunch;
  }

  getLaunchesByIds({ launchIds }) {
    return Promise.all(launchIds.map((launchId) => this.getLaunchById({ launchId })));
  }
}

module.exports = LaunchAPI;
