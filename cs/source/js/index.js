import {startHistory} from 'muce.io';

import '../style/reset.scss';
import router from './router';
import LayoutView from './layout_view';



var app = new LayoutView({
	el: '#js-view',
	router: router
});

startHistory({});

export default app;
