import {BaseView} from 'muce.io';

import AnaliticsModel from './model';
 

class AnaliticsModuleView extends BaseView {
	initialize(options) {
		this.model = new AnaliticsModel({});
		super.initialize(options);
	}
	showDefaultResult(query) {
		var interval, timeout = 10;

		this.model.set({queryString: query, token: undefined});
		this.model.fetch().then(() => {
			if (this.model.get('token')) {
				interval = setInterval(() => {
					if (--timeout < 0) {
						clearInterval(interval);
					}
					this.model.fetch().then(() => {
						this.showCharts();
					});
				}, 500);
			}
			this.showCharts();
		});
		console.log(query);
	}
	showCharts() {
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