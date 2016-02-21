import {$, BaseView} from 'muce.io';

import AnaliticsModel from './model';
//import {SmoothieChart} from 'js/smoothie';
import template from 'templates/analitics.html';
import withinTemplate from 'templates/waitnig_block.html';
import errorTemplate from 'templates/error_template.html';
 

class AnaliticsModuleView extends BaseView {
	initialize(options) {
		this.model = new AnaliticsModel({});
		this.$el = $('#jsc-page');
		this.template = template;
		super.initialize(options);
	}
	parseResult(query) {
		var timeout = 100;

		clearInterval(this.fetchInterval);
		this.renderWaiting();
		this.model.set({queryString: query, token: undefined, status: 0});
		this.model.fetch().then(() => {
			if (this.model.get('token')) {
				this.fetchInterval = setInterval(() => {
					if (--timeout < 0 && this.model.get('status') === 0) {
						clearInterval(this.fetchInterval);
						this.renderError();
						return;
					}
					this.model.fetch().then(() => {
						if (this.model.get('status') > 1) {
							clearInterval(this.fetchInterval);
						}
						this.renderCb();
					});
				}, 1000);
			}
			this.renderCb();
		}, () => {
			this.renderError();
		});
	}
	renderError() {
		this.render();
		this.$el.append(errorTemplate());
	}
	renderWaiting() {
		this.render();
		this.$el.append(withinTemplate({}));

	}
	chartOptions() {
		var width = Math.floor(window.screen.width * 0.83);
		
		return {
			graph: {
				orientation: "Vertical"
			},
			dimension: {
				width: width
			},
			axis: {
				tick: 16,
				subtick: 4,
				showsubtick: false
			}
		}
	}
	renderCb() {}
	countByDay(query) {
		this.renderCb = () => {
			this.showCharts(query, 'StackedArea', {
				categories: ['Tweets by day'],
				dataset: {
					'Tweets by day': this.model.getCountByTime(2)
				}
			});
		}
		this.parseResult(query);
	}
	countByHour(query) {
		this.renderCb = () => {
			this.showCharts(query, 'StackedArea', {
				categories: ['Tweets by hour'],
				dataset: {
					'Tweets by hour': this.model.getCountByTime(3)
				}
			});
		}
		this.parseResult(query);
	}
	retweetByDay(query) {
		
	}
	retweetByHour(query) {
		
	}
	moodByDay(query) {
		
	}
	moodByHour(query) {
		
	}
	showCharts(query, type, data) {
		var chartObject;
		console.log(this.model.attributes)
		this.render({query: query});
		if (this.model.get('status') === 0) {
			this.$el.append(withinTemplate({}));
			return;
		}

		chartObject = uv.chart(type, data, this.chartOptions());
	}

}

var AnaliticsModuleRoutes = {
	View: AnaliticsModuleView,
	prefix: 'result',
	moduleName: 'analitics',
	routes: [
		{path: '/:query', action: 'countByDay'},
		{path: '/cbh/:query', action: 'countByHour'},
		{path: '/rbd/:query', action: 'retweetByDay'},
		{path: '/rbh/:query', action: 'retweetByHour'},
		{path: '/mbd/:query', action: 'moodByDay'},
		{path: '/mbh/:query', action: 'moodByHour'}
	]
}

export {AnaliticsModuleRoutes};