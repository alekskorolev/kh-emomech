import {startHistory} from 'muce.io';

import router from './router';
import '../style/reset.scss';
import LayoutView from './layout_view';



var app = new LayoutView({
	el: '#js-view',
	router: router
});

startHistory({});

export default app;
