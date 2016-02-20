import {BaseView} from 'muce.io';

import AnaliticsModel from './model';
 

class AnaliticsModuleView extends BaseView {
	initialize(options) {
		this.model = new AnaliticsModel({});
		super.initialize(options);
	}
	showDefaultResult(query) {
		this.model.set({queryString: query});
		this.model.fetch().then(() => {
			this.showCharts();
		});
		console.log(query);
	}
	showCharts() {
		console.log(this.model);
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