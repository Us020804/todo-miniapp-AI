"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      newTask: "",
      taskList: [],
      currentFilter: "all",
      showActionPopup: false,
      showEditPopup: false,
      currentTask: null,
      editText: ""
    };
  },
  onLoad() {
    this.loadTasks();
  },
  computed: {
    completedCount() {
      return this.taskList.filter((item) => item.completed).length;
    },
    activeCount() {
      return this.taskList.filter((item) => !item.completed).length;
    },
    filteredTaskList() {
      if (this.currentFilter === "active") {
        return this.taskList.filter((item) => !item.completed);
      }
      if (this.currentFilter === "completed") {
        return this.taskList.filter((item) => item.completed);
      }
      return this.taskList;
    }
  },
  methods: {
    addTask() {
      if (!this.newTask.trim()) {
        common_vendor.index.showToast({
          title: "请输入内容",
          icon: "none"
        });
        return;
      }
      this.taskList.push({
        text: this.newTask.trim(),
        completed: false
      });
      this.newTask = "";
      this.saveTasks();
    },
    changeFilter(type) {
      this.currentFilter = type;
    },
    openActionPopup(item) {
      this.currentTask = item;
      this.showActionPopup = true;
    },
    closeActionPopup() {
      this.showActionPopup = false;
    },
    markCompleted() {
      if (this.currentTask) {
        this.currentTask.completed = true;
        this.saveTasks();
      }
      this.closeActionPopup();
    },
    markActive() {
      if (this.currentTask) {
        this.currentTask.completed = false;
        this.saveTasks();
      }
      this.closeActionPopup();
    },
    deleteCurrentTask() {
      if (this.currentTask) {
        const index = this.taskList.indexOf(this.currentTask);
        if (index !== -1) {
          this.taskList.splice(index, 1);
          this.saveTasks();
        }
      }
      this.closeActionPopup();
      this.currentTask = null;
    },
    openEditPopup() {
      if (!this.currentTask)
        return;
      this.editText = this.currentTask.text;
      this.showActionPopup = false;
      this.showEditPopup = true;
    },
    closeEditPopup() {
      this.showEditPopup = false;
      this.editText = "";
      this.currentTask = null;
    },
    confirmEdit() {
      if (!this.editText.trim()) {
        common_vendor.index.showToast({
          title: "任务内容不能为空",
          icon: "none"
        });
        return;
      }
      if (this.currentTask) {
        this.currentTask.text = this.editText.trim();
        this.saveTasks();
      }
      this.showEditPopup = false;
      this.editText = "";
      this.currentTask = null;
    },
    saveTasks() {
      common_vendor.index.setStorageSync("todoList", this.taskList);
    },
    loadTasks() {
      const data = common_vendor.index.getStorageSync("todoList");
      if (data) {
        this.taskList = data;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.newTask,
    b: common_vendor.o(($event) => $data.newTask = $event.detail.value),
    c: common_vendor.o((...args) => $options.addTask && $options.addTask(...args)),
    d: common_vendor.t($data.taskList.length),
    e: common_vendor.t($options.completedCount),
    f: common_vendor.t($options.activeCount),
    g: $data.currentFilter === "all" ? 1 : "",
    h: common_vendor.o(($event) => $options.changeFilter("all")),
    i: $data.currentFilter === "active" ? 1 : "",
    j: common_vendor.o(($event) => $options.changeFilter("active")),
    k: $data.currentFilter === "completed" ? 1 : "",
    l: common_vendor.o(($event) => $options.changeFilter("completed")),
    m: common_vendor.f($options.filteredTaskList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text),
        b: item.completed ? 1 : "",
        c: common_vendor.o(($event) => $options.openActionPopup(item), index),
        d: index
      };
    }),
    n: $options.filteredTaskList.length === 0
  }, $options.filteredTaskList.length === 0 ? {} : {}, {
    o: $data.showActionPopup
  }, $data.showActionPopup ? {
    p: common_vendor.o((...args) => $options.markCompleted && $options.markCompleted(...args)),
    q: common_vendor.o((...args) => $options.markActive && $options.markActive(...args)),
    r: common_vendor.o((...args) => $options.openEditPopup && $options.openEditPopup(...args)),
    s: common_vendor.o((...args) => $options.deleteCurrentTask && $options.deleteCurrentTask(...args)),
    t: common_vendor.o((...args) => $options.closeActionPopup && $options.closeActionPopup(...args)),
    v: common_vendor.o(() => {
    }),
    w: common_vendor.o((...args) => $options.closeActionPopup && $options.closeActionPopup(...args))
  } : {}, {
    x: $data.showEditPopup
  }, $data.showEditPopup ? {
    y: $data.editText,
    z: common_vendor.o(($event) => $data.editText = $event.detail.value),
    A: common_vendor.o((...args) => $options.confirmEdit && $options.confirmEdit(...args)),
    B: common_vendor.o((...args) => $options.closeEditPopup && $options.closeEditPopup(...args)),
    C: common_vendor.o(() => {
    }),
    D: common_vendor.o((...args) => $options.closeEditPopup && $options.closeEditPopup(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
