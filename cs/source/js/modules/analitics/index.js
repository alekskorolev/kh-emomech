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
	showDefaultResult(query) {
		var interval, timeout = 100;

		this.model.set({queryString: query, token: undefined, status: 0});
		this.model.fetch().then(() => {
			if (this.model.get('token')) {
				interval = setInterval(() => {
					if (--timeout < 0 && this.model.get('status') === 0) {
						clearInterval(interval);
						this.renderError();
						return;
					}
					this.model.fetch().then(() => {
						if (this.model.get('status') > 1) {
							clearInterval(interval);
						}
						this.showCharts();
					});
				}, 3000);
			}
			this.showCharts();
		}, () => {
			this.renderError();
		});
		console.log(query);
	}
	renderError() {
		this.render();
		this.$el.append(errorTemplate());
	}
	showCharts() {
		this.render();
		if (this.model.get('status') === 0) {
			console.log('withing')
			this.$el.append(withinTemplate({}));
			return;
		}
		console.log('render')
		var chartObject = uv.chart('StackedArea', {
			categories : ['Tweets by day'],
			dataset : {
				'Tweets by day': this.model.getCountByTime(2)
			}
		}, {
			graph: {
				orientation: "Vertical"
			}
		});
		this.$el.append(chartObject)
/*		this.smoothie = this.smoothie || new SmoothieChart();
		this.smoothie.streamTo(this.$('#jsc-analitic-canvas')[0]);*/
		console.log(chartObject)
		console.log(this.model);
		// если статус модели 0 - показываем прелоадер
		// иначе рендерим графики
	}

}

var AnaliticsModuleRoutes = {
	View: AnaliticsModuleView,
	prefix: 'result',
	moduleName: 'analitics',
	routes: [
		{path: '/:query', action: 'showDefaultResult'}
	]
}

export {AnaliticsModuleRoutes};