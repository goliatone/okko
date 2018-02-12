import {Store} from 'svelte/store';


class RootStore extends Store {
    setApplications(applications) {
        this.set({applications});
    }
}

const store = new RootStore({
    online: 0,
    offline: 0,
    applications: [],
    application: {}
});

export default store;