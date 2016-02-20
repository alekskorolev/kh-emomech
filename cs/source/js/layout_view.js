import {
	_,
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
		console.log('route')
		// TODO: сделать смену состояния лайаута при смене роута
	}
	beforeInitialize(options) {
		var authenticateWidget,
			feedbackWidget;

		this.template = layoutTmpl;
		this.delegateEvents({
			'action.search': 'doSearch'
		});
		super.beforeInitialize(options);
	}
	afterInitialize(options) {
		super.afterInitialize(options);
		this.render({ headerState: 'big' /* для неглавной страницы состояние small */});
		this.router = options.router;
		this.router.app = this;
		this.bindRoute();
/*		this.$el.on('action.search', _.bind(this, this.doSearch));*/
	}
	doSearch(event) {
		var query = encodeURI(_.extract(event, 'extra.value', ''));

		this.router.navigate('result/' + query, {trigger: true});
	}
}

export default LayoutView;