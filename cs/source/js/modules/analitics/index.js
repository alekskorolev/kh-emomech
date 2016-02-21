import {$, BaseView} from 'muce.io';

import AnaliticsModel from './model';
//import {SmoothieChart} from 'js/smoothie';
import template from 'templates/analitics.html';
 

class AnaliticsModuleView extends BaseView {
	initialize(options) {
		this.model = new AnaliticsModel({});
		this.$el = $('#jsc-page');
		this.template = template;
		super.initialize(options);
	}
	showDefaultResult(query) {
		var interval, timeout = 30;

		this.model.set({queryString: query, token: undefined, status: 0});
		this.model.fetch().then(() => {
			if (this.model.get('token')) {
				interval = setInterval(() => {
					if (--timeout < 0 || this.model.get('status') > 0) {
						clearInterval(interval);
					}
					this.model.fetch().then(() => {
						if (this.model.get('status') > 0) {
							clearInterval(interval);
						}
						this.showCharts();
					});
				}, 1500);
			}
			this.showCharts();
		});
		console.log(query);
	}
	showCharts() {
		this.render();
		var chartObject = uv.chart('Line', {
			categories : ['t1', 't2'],
			dataset : {
				t1: [
					{name: 1, value: 5},
					{name: 2, value: 3}
				],
				t2: [
					{name: 1, value: 7},
					{name: 2, value: 2}
				]
			}
		}, {});
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