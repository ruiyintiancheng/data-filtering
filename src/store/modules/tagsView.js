import { deepClone } from '@/utils/index'
const tagsView = {
  state: {
    visitedViews: [],
    cachedViews: [],
    existComponent: [],
    // 无权限提示
    errorListStr: '',
    // 无权限已提示集合
    errorNotifitionList: []
  },
  mutations: {
    DELETE_ERROR_NOTIFITION: (state, notifition) => {
      const index = state.errorNotifitionList.findIndex(item => item.path === notifition.path && item.value === notifition.value)
      if (index !== -1) {
        state.errorNotifitionList.splice(index, 1)
      }
    },
    DELETE_ERROR_NOTIFITIONS: (state, notifition) => {
      state.errorNotifitionList = state.errorNotifitionList.filter(item => {
        return notifition.some(it => it.path !== item.path)
      })
    },
    UPDATE_ERROR_NOTIFITION: (state, notifition) => {
      for (const iterator of state.errorNotifitionList) {
        if (iterator.path === notifition.path && iterator.value === notifition.value) {
          iterator.notify = notifition.notify
        }
      }
    },
    ADD_ERROR_NOTIFITION: (state, notifition) => {
      state.errorNotifitionList.push(notifition)
    },
    CHANGE_ERROR_LIST: (state, listStr) => {
      state.errorListStr = listStr
    },
    ADD_VISITED_VIEWS: (state, view) => {
      if (state.visitedViews.some(v => {
        const vpath = v.path.split('/')[v.path.split('/').length - 1]
        const wpath = view.path.split('/')[view.path.split('/').length - 1]
        return vpath === wpath
      })) return
      state.visitedViews.push({
        name: view.name,
        path: view.path,
        title: view.meta.title || 'no-name'
      })
      state.existComponent = deepClone(state.cachedViews)
      if (!view.meta.noCache) {
        state.cachedViews.push(view.name)
      }
    },
    DEL_VISITED_VIEWS: (state, view) => {
      for (const [i, v] of state.visitedViews.entries()) {
        if (v.path === view.path) {
          state.visitedViews.splice(i, 1)
          break
        }
      }
      for (const i of state.cachedViews) {
        if (i === view.name) {
          const index = state.cachedViews.indexOf(i)
          state.cachedViews.splice(index, 1)
          break
        }
      }
    },
    DEL_OTHERS_VIEWS: (state, view) => {
      state.visitedViews = state.visitedViews.filter(item => item.path === view.path || item.name === 'dashboard')
      state.cachedViews = state.cachedViews.filter(item => item === view.name || item === 'dashboard')
    },
    DEL_ALL_VIEWS: (state) => {
      state.visitedViews = []
      state.cachedViews = []
    }
  },
  actions: {
    deleteErrorNotifitions({ commit }, view) {
      commit('DELETE_ERROR_NOTIFITIONS', view)
    },
    deleteErrorNotifition({ commit }, view) {
      commit('DELETE_ERROR_NOTIFITION', view)
    },
    updateErrorNotifition({ commit }, view) {
      commit('UPDATE_ERROR_NOTIFITION', view)
    },
    addErrorNotifition({ commit }, view) {
      commit('ADD_ERROR_NOTIFITION', view)
    },
    changeErrorList({ commit }, view) {
      commit('CHANGE_ERROR_LIST', view)
    },
    addVisitedViews({ commit }, view) {
      commit('ADD_VISITED_VIEWS', view)
    },
    delVisitedViews({ commit, state }, view) {
      return new Promise((resolve) => {
        commit('DEL_VISITED_VIEWS', view)
        resolve([...state.visitedViews])
      })
    },
    delOthersViews({ commit, state }, view) {
      return new Promise((resolve) => {
        commit('DEL_OTHERS_VIEWS', view)
        resolve([...state.visitedViews])
      })
    },
    delAllViews({ commit, state }) {
      return new Promise((resolve) => {
        commit('DEL_ALL_VIEWS')
        resolve([...state.visitedViews])
      })
    }
  }
}

export default tagsView
