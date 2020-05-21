// import { fetchOption, fetchList } from '@/api/publicReport'
const publicReport = {
  state: {
    publicReports: {},
    currentComponent: {}
  },
  mutations: {
    SET_BASE_PUBLIC_REPORT: (state, view) => {
      state.publicReports[view.name] = view
    },
    DELETE_BASE_PUBLIC_REPORT: (state, name) => {
      delete state.publicReports[name]
    }
  },
  actions: {
    setBasePublicReport({ commit, state }, view) {
      return new Promise((resolve) => {
        commit('SET_BASE_PUBLIC_REPORT', view)
        resolve()
      })
    },
    deleteBasePublicReport({ commit, state }, name) {
      return new Promise((resolve) => {
        commit('DELETE_BASE_PUBLIC_REPORT', name)
        resolve()
      })
    }

  }
}

export default publicReport

