import {BaseModel} from 'muce.io';

import config from 'cs/config/app.conf.js';

class AnaliticsModel extends BaseModel {
	initialize(options) {
		this.Url = config.common.api.getUrl();
	}
	url(options) {
		var url = this.Url;

		if (this.get('token')) {
			url += 'result/' + this.get('token');
		} else {
			url += 'parse?q=' + this.get('queryString');
		}
		return url;
	}
}

export default AnaliticsModel;