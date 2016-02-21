import {_, BaseModel} from 'muce.io';

import config from 'cs/config/app.conf.js';

class AnaliticsModel extends BaseModel {
	initialize(options) {
		this.Url = config.common.api.getUrl();
	}
	url(options) {
		var url = this.Url;

		if (this.get('token')) {
			url += 'statistic/' + this.get('token');
		} else {
			url += 'statistic?q=' + this.get('queryString');
		}
		return url;
	}
	getTimeKey(time, period = 0) {
		var key = time.getFullYear();

		if (period === 0) return key;
		if (period > 0) key += '.' + (time.getMonth() + 1);
		if (period > 1) key += '.' + time.getDate();
		if (period > 2) key += ' ' + time.getHours();
		if (period > 3) key += ':' + time.getMinutes();
		if (period > 4) key += ':' + time.getSeconds();
		return key;
	}
	getCountByTime(period = 2) { 
		var rawList = _.extract(this.attributes, 'result.statuses', []),
			parsedData = {},
			timeKey,
			parsedList = [];

		rawList.forEach((msg) => {
			if (!_.isDate(msg.created_at)) {
				msg.created_at = new Date(msg.created_at);
			}
			timeKey = this.getTimeKey(msg.created_at, period);

			parsedData[timeKey] = (parsedData[timeKey] || 0) + 1;
		});

		_.each(parsedData, (value, key) => {
			parsedList.unshift({name: key, value: value});
		});
		return parsedList;
	}
}

export default AnaliticsModel;