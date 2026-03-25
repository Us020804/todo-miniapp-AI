<template>
  <view class="container">
    <view class="title">我的待办清单</view>

    <view class="input-area">
      <input
        class="task-input"
        v-model="newTask"
        placeholder="请输入待办事项"
      />
      <button class="add-btn" @click="addTask">添加</button>
    </view>

    <view class="list-area">
      <view
        class="task-item"
        v-for="(item, index) in taskList"
        :key="index"
      >
       <text :class="{ 'task-text': true, completed: item.completed }">
         {{ item.text }}
       </text>
	   
        <view class="btn-group">
          <button class="edit-btn" size="mini" @click="openActionPopup(item)">
            修改
          </button>
        </view>
		
		
		
		
		
		
      </view>
    </view>
  </view>
  <view v-if="showActionPopup" class="popup-mask" @click="closeActionPopup">
    <view class="popup-content" @click.stop>
      <view class="popup-title">任务操作</view>
  
      <button class="popup-btn" @click="markCompleted">已完成</button>
      <button class="popup-btn" @click="markActive">未完成</button>
      <button class="popup-btn" @click="openEditPopup">编辑任务内容</button>
      <button class="popup-btn delete-popup-btn" @click="deleteCurrentTask">删除</button>
      <button class="popup-cancel-btn" @click="closeActionPopup">取消</button>
    </view>
  </view>
  <view v-if="showEditPopup" class="popup-mask" @click="closeEditPopup">
    <view class="popup-content" @click.stop>
      <view class="popup-title">编辑任务</view>
  
      <input
        class="edit-input"
        v-model="editText"
        placeholder="请输入新的任务内容"
      />
  
      <button class="popup-btn" @click="confirmEdit">确定</button>
      <button class="popup-cancel-btn" @click="closeEditPopup">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      newTask: '',
      taskList: []
    }
  },
  methods: {
    addTask() {
      if (!this.newTask.trim()) {
        uni.showToast({
          title: '请输入内容',
          icon: 'none'
        })
        return
      }

      this.taskList.push({
        text: this.newTask,
        completed: false
      })

      this.newTask = ''
    },

    toggleTask(index) {
      this.taskList[index].completed = !this.taskList[index].completed
    },

    deleteTask(index) {
      this.taskList.splice(index, 1)
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
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
  margin-bottom: 20px;
}

.task-input {
  flex: 1;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
  background-color: #fff;
}

.add-btn {
  width: 90px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
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

.task-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.task-text.completed {
  color: #999;
  text-decoration: line-through;
}

.btn-group {
  display: flex;
  gap: 8px;
  margin-left: 10px;
}

.done-btn {
  background-color: #4cd964;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}
</style>