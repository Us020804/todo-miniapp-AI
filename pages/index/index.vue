<template>
  <view class="container">
    <view class="title">我的待办清单</view>

    <!-- 输入区域 -->
    <view class="input-area">
      <input
        class="task-input"
        v-model="newTask"
        placeholder="请输入待办事项"
      />
      <button class="add-btn" @click="addTask">添加</button>
    </view>

    <!-- 截止时间 -->
    <view class="deadline-area">
      <text class="deadline-label">截止日期：</text>
      <picker mode="date" :value="newDeadline" @change="onNewDeadlineChange">
        <view class="deadline-picker">
          {{ newDeadline || '请选择截止日期' }}
        </view>
      </picker>

      <view class="picker-block">
        <text class="deadline-label">截止时分：</text>
        <picker mode="time" :value="newDeadlineTime" @change="onNewDeadlineTimeChange">
          <view class="deadline-picker">
            {{ newDeadlineTime || '请选择截止时间' }}
          </view>
        </picker>
      </view>
    </view>

    <!-- 提醒设置 -->
    <view class="remind-area">
      <view class="remind-switch-row">
        <text class="deadline-label">开启提醒：</text>
        <switch :checked="newRemindEnabled" @change="onNewRemindSwitchChange" />
      </view>

      <view v-if="newRemindEnabled">
        <view class="picker-block">
          <text class="deadline-label">提醒日期：</text>
          <picker mode="date" :value="newRemindDate" @change="onNewRemindDateChange">
            <view class="deadline-picker">
              {{ newRemindDate || '请选择提醒日期' }}
            </view>
          </picker>
        </view>

        <view class="picker-block">
          <text class="deadline-label">提醒时间：</text>
          <picker mode="time" :value="newRemindTime" @change="onNewRemindTimeChange">
            <view class="deadline-picker">
              {{ newRemindTime || '请选择提醒时间' }}
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 统计区域 -->
    <view class="stats-area">
      <text>总数：{{ taskList.length }}</text>
      <text>已完成：{{ completedCount }}</text>
      <text>未完成：{{ activeCount }}</text>
    </view>

    <!-- 清空已完成 -->
    <view class="clear-completed-area">
      <button class="clear-completed-btn" size="mini" @click="clearCompletedTasks">
        清空已完成的所有任务
      </button>
    </view>
	
	<view class="status-tip-box">
	  <text class="tip-item tip-overdue">红色：已逾期</text>
	  <text class="tip-item tip-remind">蓝色：已设置提醒</text>
	  <text class="tip-item tip-normal">灰色删除线：已完成</text>
	</view>
	
    <!-- 筛选区域 -->
    <view class="filter-area">
      <button
        class="filter-btn"
        :class="{ filterActive: currentFilter === 'all' }"
        size="mini"
        @click="changeFilter('all')"
      >
        全部
      </button>

      <button
        class="filter-btn"
        :class="{ filterActive: currentFilter === 'active' }"
        size="mini"
        @click="changeFilter('active')"
      >
        未完成
      </button>

      <button
        class="filter-btn"
        :class="{ filterActive: currentFilter === 'completed' }"
        size="mini"
        @click="changeFilter('completed')"
      >
        已完成
      </button>
    </view>

    <!-- 列表区域 -->
    <view class="list-area">
      <view
        class="task-item"
        :class="{ overdueCard: isOverdue(item) }"
        v-for="(item, index) in sortedFilteredTaskList"
        :key="index"
      >
        <view class="task-info">
          <view
            class="task-text"
            :class="{
              completed: item.completed,
              overdueTaskText: isOverdue(item)
            }"
          >
            {{ item.text }}
          </view>
      
          <view
            v-if="!item.completed && item.deadline"
            class="deadline-text"
            :class="{ overdueText: isOverdue(item) }"
          >
            <text v-if="isOverdue(item)" class="status-badge overdueBadge">已逾期</text>
            截止：{{ item.deadline }} {{ item.deadlineTime }}
          </view>
      
          <view
            v-if="!item.completed && item.remindEnabled && item.remindDate && item.remindTime"
            class="remind-text"
          >
            提醒：{{ item.remindDate }} {{ item.remindTime }}
          </view>
        </view>
      
        <view class="btn-group">
          <button class="edit-btn" size="mini" @click="openActionPopup(item)">
            修改
          </button>
        </view>
      </view>

      <view v-if="filteredTaskList.length === 0" class="empty-tip">
        当前筛选下没有任务
      </view>
    </view>

    <!-- 操作弹窗 -->
    <view
      v-if="showActionPopup"
      class="popup-mask"
      @click="closeActionPopup"
    >
      <view class="popup-content" @click.stop>
        <view class="popup-title">任务操作</view>

        <button class="popup-btn" @click="markCompleted">已完成</button>
        <button class="popup-btn" @click="markActive">未完成</button>
        <button class="popup-btn" @click="openEditPopup">编辑任务内容</button>
        <button class="popup-btn delete-popup-btn" @click="deleteCurrentTask">
          删除
        </button>
        <button class="popup-cancel-btn" @click="closeActionPopup">
          取消
        </button>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view
      v-if="showEditPopup"
      class="popup-mask"
      @click="closeEditPopup"
    >
      <view class="popup-content" @click.stop>
        <view class="popup-title">编辑任务</view>

        <input
          class="edit-input"
          v-model="editText"
          placeholder="请输入新的任务内容"
        />

        <view v-if="currentTask && !currentTask.completed" class="popup-deadline-area">
          <text class="deadline-label">截止日期：</text>
          <picker mode="date" :value="editDeadline" @change="onEditDeadlineChange">
            <view class="deadline-picker">
              {{ editDeadline || '请选择截止日期' }}
            </view>
          </picker>

          <view class="picker-block">
            <text class="deadline-label">截止时分：</text>
            <picker mode="time" :value="editDeadlineTime" @change="onEditDeadlineTimeChange">
              <view class="deadline-picker">
                {{ editDeadlineTime || '请选择截止时间' }}
              </view>
            </picker>
          </view>
        </view>

        <view v-if="currentTask && !currentTask.completed" class="popup-deadline-area">
          <view class="remind-switch-row">
            <text class="deadline-label">开启提醒：</text>
            <switch :checked="editRemindEnabled" @change="onEditRemindSwitchChange" />
          </view>

          <view v-if="editRemindEnabled">
            <view class="picker-block">
              <text class="deadline-label">提醒日期：</text>
              <picker mode="date" :value="editRemindDate" @change="onEditRemindDateChange">
                <view class="deadline-picker">
                  {{ editRemindDate || '请选择提醒日期' }}
                </view>
              </picker>
            </view>

            <view class="picker-block">
              <text class="deadline-label">提醒时间：</text>
              <picker mode="time" :value="editRemindTime" @change="onEditRemindTimeChange">
                <view class="deadline-picker">
                  {{ editRemindTime || '请选择提醒时间' }}
                </view>
              </picker>
            </view>
          </view>
        </view>

        <button class="popup-btn confirm-btn" @click="confirmEdit">确定</button>
        <button class="popup-cancel-btn" @click="closeEditPopup">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      newTask: '',
      newDeadline: '',
      newDeadlineTime: '',
      newRemindEnabled: false,
      newRemindDate: '',
      newRemindTime: '',

      taskList: [],
      currentFilter: 'all',
      showActionPopup: false,
      showEditPopup: false,
      currentTask: null,

      editText: '',
      editDeadline: '',
      editDeadlineTime: '',
      editRemindEnabled: false,
      editRemindDate: '',
      editRemindTime: ''
    }
  },

  onLoad() {
    this.newDeadline = this.getToday()
    this.newDeadlineTime = this.getCurrentTime()
    this.newRemindDate = this.getToday()
    this.loadTasks()
  },

  computed: {
    completedCount() {
      return this.taskList.filter(item => item.completed).length
    },

    activeCount() {
      return this.taskList.filter(item => !item.completed).length
    },

    filteredTaskList() {
      if (this.currentFilter === 'active') {
        return this.taskList.filter(item => !item.completed)
      }

      if (this.currentFilter === 'completed') {
        return this.taskList.filter(item => item.completed)
      }

      return this.taskList
    },

    sortedFilteredTaskList() {
      const baseList = this.filteredTaskList

      // 已完成筛选：保持相对顺序，不做额外排序
      if (this.currentFilter === 'completed') {
        return baseList
      }

      const incompleteList = baseList.filter(item => !item.completed)
      const completedList = baseList.filter(item => item.completed)

      const incompleteSorted = incompleteList
        .map((item, idx) => ({ item, idx }))
        .sort((a, b) => {
          const aTs = this.toTimestamp(a.item.deadline, a.item.deadlineTime)
          const bTs = this.toTimestamp(b.item.deadline, b.item.deadlineTime)

          const aVal = Number.isNaN(aTs) ? Infinity : aTs
          const bVal = Number.isNaN(bTs) ? Infinity : bTs

          // 截止时间升序；同一截止时间下保持原相对顺序
          if (aVal !== bVal) return aVal - bVal
          return a.idx - b.idx
        })
        .map(x => x.item)

      // 未完成筛选：只显示未完成（自然就是按截止升序）
      if (this.currentFilter === 'active') {
        return incompleteSorted
      }

      // 全部筛选：未完成在前；已完成保持原相对顺序
      return incompleteSorted.concat(completedList)
    }
  },

  methods: {
    getToday() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    getCurrentTime() {
      const date = new Date()
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${hour}:${minute}`
    },

    toTimestamp(dateStr, timeStr) {
      if (!dateStr || !timeStr) return NaN
      // 微信小程序等端对 `new Date('YYYY/MM/DD HH:mm')` 解析可能不稳定
      // 这里手动拆分年月日时分，确保时间戳计算一致
      const [y, m, d] = String(dateStr).split('-').map(Number)
      const [hh, mm] = String(timeStr).split(':').map(Number)

      if ([y, m, d, hh, mm].some(n => Number.isNaN(n))) return NaN

      return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
    },

    validateTimeRange(deadlineDate, deadlineTime, remindEnabled, remindDate, remindTime) {
      if (!deadlineDate || !deadlineTime) {
        return '请选择完整截止时间'
      }

      if (remindEnabled) {
        if (!remindDate || !remindTime) {
          return '请选择完整提醒时间'
        }

        const deadlineTs = this.toTimestamp(deadlineDate, deadlineTime)
        const remindTs = this.toTimestamp(remindDate, remindTime)

        if (Number.isNaN(deadlineTs) || Number.isNaN(remindTs)) {
          return '时间格式无效'
        }

        if (remindTs > deadlineTs) {
          return '提醒时间不能晚于截止时间'
        }
      }
	
      return ''
    },

    onNewDeadlineChange(e) {
      this.newDeadline = e.detail.value
    },

    onNewDeadlineTimeChange(e) {
      this.newDeadlineTime = e.detail.value
    },

    onEditDeadlineChange(e) {
      this.editDeadline = e.detail.value
    },

    onEditDeadlineTimeChange(e) {
      this.editDeadlineTime = e.detail.value
    },

    onNewRemindSwitchChange(e) {
      this.newRemindEnabled = e.detail.value
      if (this.newRemindEnabled) {
        if (!this.newRemindDate) this.newRemindDate = this.getToday()
      } else {
        this.newRemindDate = ''
        this.newRemindTime = ''
      }
    },

    onNewRemindDateChange(e) {
      this.newRemindDate = e.detail.value
    },

    onNewRemindTimeChange(e) {
      this.newRemindTime = e.detail.value
    },

    onEditRemindSwitchChange(e) {
      this.editRemindEnabled = e.detail.value
      if (this.editRemindEnabled) {
        if (!this.editRemindDate) this.editRemindDate = this.getToday()
      } else {
        this.editRemindDate = ''
        this.editRemindTime = ''
      }
    },

    onEditRemindDateChange(e) {
      this.editRemindDate = e.detail.value
    },

    onEditRemindTimeChange(e) {
      this.editRemindTime = e.detail.value
    },

    addTask() {
      if (!this.newTask.trim()) {
        uni.showToast({
          title: '请输入内容',
          icon: 'none'
        })
        return
      }

      const timeError = this.validateTimeRange(
        this.newDeadline,
        this.newDeadlineTime,
        this.newRemindEnabled,
        this.newRemindDate,
        this.newRemindTime
      )

      if (timeError) {
        uni.showToast({
          title: timeError,
          icon: 'none'
        })
        return
      }

      this.taskList.push({
        text: this.newTask.trim(),
        completed: false,
        deadline: this.newDeadline,
        deadlineTime: this.newDeadlineTime,
        remindEnabled: this.newRemindEnabled,
        remindDate: this.newRemindEnabled ? this.newRemindDate : '',
        remindTime: this.newRemindEnabled ? this.newRemindTime : ''
      })

      this.newTask = ''
      this.newDeadline = this.getToday()
      this.newDeadlineTime = this.getCurrentTime()
      this.newRemindEnabled = false
      this.newRemindDate = this.getToday()
      this.newRemindTime = ''
      this.saveTasks()
    },

    changeFilter(type) {
      this.currentFilter = type
    },

    openActionPopup(item) {
      this.currentTask = item
      this.showActionPopup = true
    },

    closeActionPopup() {
      this.showActionPopup = false
    },

    markCompleted() {
      if (this.currentTask) {
        this.currentTask.completed = true
        this.saveTasks()
      }
      this.closeActionPopup()
    },

    markActive() {
      if (this.currentTask) {
        this.currentTask.completed = false
        if (!this.currentTask.deadline) {
          this.currentTask.deadline = this.getToday()
        }
        if (!this.currentTask.deadlineTime) {
          this.currentTask.deadlineTime = '23:59'
        }
        this.saveTasks()
      }
      this.closeActionPopup()
    },

    deleteCurrentTask() {
      if (this.currentTask) {
        const index = this.taskList.indexOf(this.currentTask)
        if (index !== -1) {
          this.taskList.splice(index, 1)
          this.saveTasks()
        }
      }

      this.closeActionPopup()
      this.currentTask = null
    },

    clearCompletedTasks() {
      const completedCount = this.taskList.filter(item => item.completed).length
      if (completedCount === 0) {
        uni.showToast({
          title: '没有可清空的已完成任务',
          icon: 'none'
        })
        return
      }

      uni.showModal({
        title: '提示',
        content: '确定清空所有已完成任务吗？',
        success: (res) => {
          if (res.confirm) {
            this.taskList = this.taskList.filter(item => !item.completed)

            // 关闭弹窗并清理当前选择，避免引用已删除任务对象
            this.closeActionPopup()
            this.currentTask = null

            this.saveTasks()
          }
        }
      })
    },

    openEditPopup() {
      if (!this.currentTask) return

      this.editText = this.currentTask.text
      this.editDeadline = this.currentTask.deadline || this.getToday()
      this.editDeadlineTime = this.currentTask.deadlineTime || '23:59'
      this.editRemindEnabled = !!this.currentTask.remindEnabled
      this.editRemindDate = this.currentTask.remindDate || this.getToday()
      this.editRemindTime = this.currentTask.remindTime || ''

      this.showActionPopup = false
      this.showEditPopup = true
    },

    closeEditPopup() {
      this.showEditPopup = false
      this.editText = ''
      this.editDeadline = ''
      this.editDeadlineTime = ''
      this.editRemindEnabled = false
      this.editRemindDate = ''
      this.editRemindTime = ''
      this.currentTask = null
    },

    confirmEdit() {
      if (!this.editText.trim()) {
        uni.showToast({
          title: '任务内容不能为空',
          icon: 'none'
        })
        return
      }

      const timeError = this.validateTimeRange(
        this.editDeadline,
        this.editDeadlineTime,
        this.editRemindEnabled,
        this.editRemindDate,
        this.editRemindTime
      )

      if (timeError) {
        uni.showToast({
          title: timeError,
          icon: 'none'
        })
        return
      }

      if (this.currentTask) {
        this.currentTask.text = this.editText.trim()

        if (!this.currentTask.completed) {
          this.currentTask.deadline = this.editDeadline
          this.currentTask.deadlineTime = this.editDeadlineTime
          this.currentTask.remindEnabled = this.editRemindEnabled
          this.currentTask.remindDate = this.editRemindEnabled ? this.editRemindDate : ''
          this.currentTask.remindTime = this.editRemindEnabled ? this.editRemindTime : ''
        }

        this.saveTasks()
      }

      this.showEditPopup = false
      this.editText = ''
      this.editDeadline = ''
      this.editDeadlineTime = ''
      this.editRemindEnabled = false
      this.editRemindDate = ''
      this.editRemindTime = ''
      this.currentTask = null
    },

    saveTasks() {
      uni.setStorageSync('todoList', this.taskList)
    },

    loadTasks() {
      const data = uni.getStorageSync('todoList')
      if (data) {
        this.taskList = data.map(item => ({
          ...item,
          deadline: item.deadline || '',
          deadlineTime: item.deadlineTime || '23:59',
          remindEnabled: item.remindEnabled || false,
          remindDate: item.remindDate || '',
          remindTime: item.remindTime || ''
        }))
      }
    },
	isOverdue(item) {
	  if (!item || item.completed) return false
	  if (!item.deadline || !item.deadlineTime) return false
	
	  const deadlineTs = this.toTimestamp(item.deadline, item.deadlineTime)
    if (Number.isNaN(deadlineTs)) return false
	  const nowTs = Date.now()
	
	  return deadlineTs < nowTs
	}
  }
}
</script>

<style>
.container {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
}

.input-area {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
  background-color: #fff;
  box-sizing: border-box;
}

.add-btn {
  width: 90px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}

.deadline-area,
.popup-deadline-area,
.remind-area {
  margin-bottom: 15px;
}

.deadline-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.deadline-picker {
  height: 40px;
  line-height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
  color: #333;
  box-sizing: border-box;
}

.remind-switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-block {
  margin-top: 10px;
}

.stats-area {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 10px;
  font-size: 14px;
  color: #555;
}

.clear-completed-area {
  margin-bottom: 15px;
}

.clear-completed-btn {
  width: 100%;
  background-color: #ff4d4f;
  color: #fff;
}

.filter-area {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-btn {
  flex: 1;
  background: #f0f0f0;
  color: #333;
}

.filterActive {
  background: #007aff;
  color: #fff;
}

.list-area {
  margin-top: 10px;
}

.task-item {
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-info {
  flex: 1;
  padding-right: 10px;
}

.task-text {
  font-size: 16px;
  color: #333;
  word-break: break-all;
}

.deadline-text {
  margin-top: 6px;
  font-size: 13px;
  color: #ff7a00;
}

.remind-text {
  margin-top: 4px;
  font-size: 13px;
  color: #007aff;
}

.task-text.completed {
  color: #999;
  text-decoration: line-through;
  text-decoration-line: line-through;
  display: inline-block;
}

.btn-group {
  display: flex;
  margin-left: 10px;
}

.edit-btn {
  background-color: #007aff;
  color: #fff;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 30px;
}

.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup-content {
  width: 300px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

.popup-btn {
  margin-bottom: 10px;
  background: #f5f5f5;
  color: #333;
}

.confirm-btn {
  background: #007aff;
  color: #fff;
}

.delete-popup-btn {
  background: #ff4d4f;
  color: #fff;
}

.popup-cancel-btn {
  background: #ddd;
  color: #333;
}

.edit-input {
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
  margin-bottom: 15px;
  background: #fff;
  box-sizing: border-box;
}

.status-tip-box {
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  font-size: 13px;
}

.tip-overdue {
  color: #ff4d4f;
}

.tip-remind {
  color: #007aff;
}

.tip-normal {
  color: #999;
}

.overdueCard {
  border: 1px solid #ffcccc;
  background: #fff5f5;
}

.overdueTaskText {
  color: #d9363e;
  font-weight: 600;
}

.overdueText {
  color: #ff4d4f;
}

.status-badge {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
}

.overdueBadge {
  background: #ff4d4f;
  color: #fff;
}
</style>