// import { fetchOption, fetchList } from '@/api/publicReport'
const systemManagement = {
  state: {
    systemManagement: {},
    currentComponent: {}
  },
  mutations: {
    SET_BASE_PUBLIC_REPORT: (state, view) => {
      state.systemManagements[view.name] = view
    },
    DELETE_BASE_PUBLIC_REPORT: (state, name) => {
      delete state.systemManagements[name]
    }
  },
  actions: {
    setBaseSystemManagement({ commit, state }, view) {
      return new Promise((resolve) => {
        commit('SET_BASE_PUBLIC_REPORT', view)
      })
    },
    deleteBaseSystemManagement({ commit, state }, name) {
      return new Promise((resolve) => {
        commit('DELETE_BASE_PUBLIC_REPORT', name)
      })
    }

  }
}

export default systemManagement

