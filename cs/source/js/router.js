import {BaseRouter} from 'muce.io';

import {AnaliticsModuleRoutes} from 'js/modules/analitics';

var router = new BaseRouter({
	moduleRoutes: [
		AnaliticsModuleRoutes
	]
});

export default router;