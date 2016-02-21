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

		this.renderWaiting();
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
				}, 1000);
			}
			this.showCharts();
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
	showCharts() {
		var chartObject, width;

		this.render();
		if (this.model.get('status') === 0) {
			this.$el.append(withinTemplate({}));
			return;
		}
		console.log(this.model.attributes)

		width = Math.floor(window.screen.width * 0.83);
		chartObject = uv.chart('StackedArea', {
			categories : ['Tweets by day'],
			dataset : {
				'Tweets by day': this.model.getCountByTime(3)
			}
		}, {
			graph: {
				orientation: "Vertical"
			},
			dimension: {
				width: width
			}
		});
/*		this.smoothie = this.smoothie || new SmoothieChart();
		this.smoothie.streamTo(this.$('#jsc-analitic-canvas')[0]);*/
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