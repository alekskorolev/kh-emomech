import {
	_,
	$,
	BaseView,
	BaseModel
} from 'muce.io';
import jscAdd from 'ehogan-loader/jscmanager';

import config from 'cs/config/app.conf.js';

import layoutTmpl from 'templates/layout.html'
import lastTmpl from 'templates/last.html'
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
		this.router.route('', this.main);
	}
	onRoute() {
		if (window.location.hash.length > 1) {
			this.$header.removeClass('big').addClass('small');
		} else {
			this.$header.removeClass('small').addClass('big');
		}
	}
	main() {
		this.model = new BaseModel();
		this.model.url = config.common.api.getUrl() + 'statistic/last/';
		this.model.fetch().then(() => {
			$('#jsc-page').append(lastTmpl({queryes: this.model.get('queryes')}));
		});
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
		this.render({ headerState: (window.location.hash.length > 1 ? 'small' : 'big')});
		this.router = options.router;
		this.router.app = this;
		this.bindRoute();
		this.$header = this.$('.jsc-header');
	}
	doSearch(event) {
		var query = encodeURI(_.extract(event, 'extra.value', ''));

		this.router.navigate('result/' + query, {trigger: true});
	}
}

export default LayoutView;