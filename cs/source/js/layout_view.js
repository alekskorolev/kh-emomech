import {
	BaseView
} from 'muce.io';
import jscAdd from 'ehogan-loader/jscmanager';

import layoutTmpl from 'templates/layout.html'
import 'style/layout.scss'

import PopupComponents from './components/popup';
import SearchComponents from './components/search';
import LoaderStateComponents from './components/loader_state';



jscAdd([
	PopupComponents,
	SearchComponents,
	LoaderStateComponents
]);

class LayoutView extends BaseView {
	bindRoute() {
		this.router.on('route', this.onRoute, this);
	}
	onRoute() {
		// TODO: сделать смену состояния лайаута при смене роута
	}
	initialize(options) {
		var authenticateWidget,
			feedbackWidget;

		this.template = layoutTmpl;
		super.initialize(options);
		this.render({ headerState: 'big' /* для неглавной страницы состояние small */});
		this.router = options.router;
		this.router.app = this;
		this.bindRoute();
	}
}

export default LayoutView;