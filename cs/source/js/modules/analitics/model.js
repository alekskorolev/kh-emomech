import {_, BaseModel} from 'muce.io';

import config from 'cs/config/app.conf.js';
import moodict from './moodict';

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
	getCountByMood(period=2) {
		var rawList = this.get('messages') || [],
			parsedData = {
				'Positive emotions': {},
				'Negative emotions': {},
				'The prevalence of positive': {}
			},
			timeKey,
			moodP,
			moodD,
			rtkeys = [],
			parsedLists = {},
			titles = [], rt;

		rawList.forEach((msg) => {
			if (!_.isDate(msg.created_at)) {
				msg.created_at = new Date(msg.created_at);
			}
			moodP = moodD = 0;
			_.each(moodict['Pleasant Feelings'], (w) => {
				if (msg.text.indexOf(w) > -1) {
					moodP += 1;
				}
			});
			_.each(moodict['Difficult/Unpleasant Feelings'], (w) => {
				if (msg.text.indexOf(w) > -1) {
					moodD += 1;
				}
			});

			msg.moodP = moodP;
			msg.moodD = moodD;
			msg.moodA = moodP - moodD;
		});

		rawList.forEach((msg) => {
			timeKey = this.getTimeKey(msg.created_at, period);

			if (_.isUndefined(parsedData['Positive emotions'][timeKey])) {
				parsedData['Positive emotions'][timeKey] = 0;
				parsedData['Negative emotions'][timeKey] = 0;
				parsedData['The prevalence of positive'][timeKey] = 0;
			}

			parsedData['Positive emotions'][timeKey] += msg.moodP;
			parsedData['Negative emotions'][timeKey] += msg.moodD;
			parsedData['The prevalence of positive'][timeKey] += msg.moodA;
		});

		_.each(parsedData, (count, cat) => {
			titles.push(cat);
			rt = parsedLists[cat] = [];
			_.each(parsedData[cat], (value, key) => {
				rt.unshift({name: key, value: value});
			});
		});
		return {categories: titles, dataset: parsedLists};

	}
	getCountByRetweet(period=2) {
		var rawList = this.get('messages') || [],
			parsedData = {},
			timeKey,
			range,
			rtkeys = [],
			parsedLists = {},
			titles = [], rt;

		rawList.forEach((msg) => {
			if (!_.isDate(msg.created_at)) {
				msg.created_at = new Date(msg.created_at);
			}
			range = (1+Math.ceil(msg.retweet_count/10))*10;
			if (rtkeys.indexOf(range) < 0) {
				rtkeys.push(range);
				parsedData[range] = {};
			}
		});

		rawList.forEach((msg) => {
			timeKey = this.getTimeKey(msg.created_at, period);
			range = (1 + Math.ceil(msg.retweet_count/10))*10;

			if (_.isUndefined(parsedData[range][timeKey])) {
				_.each(parsedData, (rtData) => {
					rtData[timeKey] = 0;
				});
			}

			parsedData[range][timeKey] += 1;
		});

		_.each(parsedData, (count, range) => {
			titles.push('less ' + range + ' retweets');
			rt = parsedLists['less ' + range + ' retweets'] = [];
			_.each(parsedData[range], (value, key) => {
				rt.unshift({name: key, value: value});
			});
		});
		return {categories: titles, dataset: parsedLists};
	}
}

export default AnaliticsModel;