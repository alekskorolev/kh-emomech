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
		var key = '';

		if (period > 0 && period < 3) key += (time.getMonth() + 1) + '.';
		if (period > 1 && period < 4) key += time.getDate();
		if (period > 2) key += ' '+Math.floor(time.getHours() / 8) * 8 + 'h';
		return key;
	}
	getCountByTime(period = 2) { 
		var rawList = this.get('messages') || [],
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
	getCountByRetweet(period=2) {
		var rawList = this.get('messages') || [],
			parsedData = {},
			timeKey,
			parsedLists = {};

		rawList.forEach((msg) => {
			if (!_.isDate(msg.created_at)) {
				msg.created_at = new Date(msg.created_at);
			}
			timeKey = this.getTimeKey(msg.created_at, period);
			parsedData
			parsedData[timeKey] = (parsedData[timeKey] || 0) + 1;

		});
	}
}

export default AnaliticsModel;