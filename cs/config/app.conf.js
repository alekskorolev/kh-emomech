import local from '../local.config';

var config = {
	common: {
		// TODO: возможно функционал вынести в либу а тут оставить только константы
		api: {
			protocol: 'http',
			domain: '169.44.58.88',
			port: 5000,
			rootPath: '/',
			urls: {},
			// TODO: можно добавить еще генерацию урла с кверисетами.
			getUrl: function(path = '') {
				if (this.urls[path]) {
					return this.urls[path];
				}

				this.url = this.url ||
					this.protocol + '://' + this.domain +
					(this.port ? ':' + this.port : '') + this.rootPath;
				this.urls[path] = this.url + path;

				return this.urls[path];
			}
		}
	}
}

if (local) {
	config = Object.assign(config, local);
}
export default config;
