


const projectName = '25-5-clock';

const audio = new Audio(
  "https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
);

const MAX_MINUTES=60, MIN_MINUTES = 1;

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

Vue.component("task-entry", {
  props: ["task-text", "index", "isChecked"],
  data: function () {
    return {
      editing: false,
    };
  },
  template: `
  <div>
    <div class="table-cell">
    <a v-if='!isChecked' @click='$emit("task-checkbox-updated",index)'>
      <i class="far fa-square"></i>
    </a>
    <a v-if='isChecked' @click='$emit("task-checkbox-updated",index)'>
      <i class="far fa-check-square"></i>
    </a>
    </div>
    <div class="table-cell">
      <!-- <input v-if='editing' class="edit-task-input" ref='task' :value='taskText' :readonly='!editing' @blur='editing=false; $emit("task-text-changed", [$event.target.value, index])' @keydown.enter="$event.target.blur()" autofocus> -->
        <div v-if='editing' class="editable-text task-text" contentEditable ref='task' @blur='editing=false; $emit("task-text-changed", [$event.target.innerText, index])' @keydown.enter="$event.target.blur()">{{ taskText }}
        </div>
        <span v-else :class='[isChecked? "strike" : "", "task-text"]' :style='transitionStyle' @blur='editing=false; $emit("task-text-changed", [$event.target.innerText, index])' @keydown.enter="$event.target.blur()" :contentEditable='editing'>{{ taskText }}</span>
    </div>
    <div class="table-cell">
    <a @click="editTask" :class='isChecked ? "hidden" : ""'>
      <i class="far fa-edit fa-fw"></i>
    </a>
    </div>
    <div class="table-cell">
    <a @click='$emit("remove-task", index)'>
      <i class="far fa-times-circle fa-fw"></i>
</a>
    </div>
  </div>
  `,
  methods: {
    editTask: function () {
      this.editing = true;
      this.$nextTick(() => {
        this.$refs.task.focus();
        console.log(this.$refs.task);
      });
    },
  },
  computed: {
    transitionStyle: function(){
      let factor = !this.isChecked ? 1 : 10;
      return "transition: background-size " + Math.min(Math.max(200,this.taskText.length * factor),2000) + "ms linear";
    }
  }
});

Vue.component("timer-adjuster", {
  props: ["current-timer-label", "timer-to-adjust", "length", "timer-running"],
  template: `
  <div class='"timer-adjustment-area"'>
    <h2 :id='timerToAdjust + "-label"'>{{ timerToAdjust }} Minutes</h2>
    <div :class='[timerRunning ? "hide-controls" : "","number-incrementer"]'>
    
      <button :id='timerToAdjust + "-decrement"' @click='$emit("decrement")' :disabled="timerRunning">
      <i class="fa fa-minus"></i>
      </button>

      <input maxlength='2' class="length-label number" :id='timerToAdjust + "-length"' v-model:value='length' @input='validateInput($event.target.value)' @change='validateTimerLength($event.target.value)' :disabled="timerRunning">

      <button :id='timerToAdjust + "-increment"' @click='$emit("increment")' :disabled="timerRunning">
      <i class="fa fa-plus"></i>        
      </button>
    
    </div>
  </div>`,
  methods: {
    validateInput: function (newValue) {
      validateTimerLength(newValue.replace(/[^0-9]/g, ""));
    },
    validateTimerLength: function (newNum) {
      let validValue = Math.max(1, Math.min(newNum, 60));
      this.$emit("set-timer", [this.timerToAdjust, validValue]);
    },
    adjustTimer: function (change) {
      this.validateTimerLength(parseInt(this.length) + change);
    },
  },
});

var app = new Vue({
  el: "#app",
  data: {
    currentTimerLabel: "session",
    elapsedSeconds: 0,
    timerRunning: false,
    timerMinutes: { break: 5, session: 25 },
    timerFunctionId: 0,
    alarmVolume: 0.7,
    tasks: [],
    taskEntry: "",
    allChecked: false,
    showSettings: false,
  },
  mounted: function() {
    this.root = document.documentElement;
    this.root.style.setProperty("--currentColor", "var(--" + this.currentTimerLabel + ")");
    this.root.style.setProperty("--current-color-light", "var(--" + this.currentTimerLabel + "-light)");
  },
  methods: {
    adjustTimerLength: function (adjustment, timer) {
      let newValue = this.timerMinutes[timer] + adjustment;
      // Set the new property forcing valid values
      this.timerMinutes[timer] = Math.max(
        Math.min(newValue, MAX_MINUTES),
        MIN_MINUTES
      );
      if (this.elapsedSeconds > 0) {
        this.elapsedSeconds = 0;
      }
    },
    startTimer: function () {
      if (!this.timerRunning) {
        this.timerFunctionId = setInterval(this.countDown, 100);
        this.timerRunning = true;
      } else {
        clearInterval(this.timerFunctionId);
        this.timerRunning = false;
      }
    },
    countDown: function () {
      this.elapsedSeconds += 1000;
      if (
        this.elapsedSeconds >
        this.timerMinutes[this.currentTimerLabel] * 60000
      ) {
        this.playAlarm();
        this.currentTimerLabel =
          this.currentTimerLabel == "session" ? "break" : "session";
        this.root.style.setProperty("--currentColor", "var(--" + this.currentTimerLabel + ")");
        this.root.style.setProperty("--current-color-light", "var(--" + this.currentTimerLabel + "-light)");
        this.elapsedSeconds = 1000;
      }
    },
    adjustVolume: function () {
      this.$refs.audio.volume = this.alarmVolume;
      this.playAlarm();
    },
    incrementVolume: function(amount){
      this.alarmVolume = Math.min(Math.max(this.alarmVolume + amount, 0),1);
      this.adjustVolume();
    },
    setTimer: function (args) {
      this.timerMinutes[args[0]] = args[1];
      this.elapsedSeconds=0;
    },
    playAlarm: function () {
      this.$refs.audio.play();
    },
    addTask: function () {
      if(this.taskEntry){
      this.tasks.push({ text: this.taskEntry, checked: false })
      this.taskEntry = '';
      }
    },
    removeTask: function (index) {
      this.tasks.splice(index, 1);
    },
    updateTaskText: function ([text, index]) {
      this.tasks[index].text = text;
    },
    updateTaskCheckedStatus: function (index) {
      this.tasks[index].checked = !this.tasks[index].checked
      this.allChecked = false;
    },
    toggleAll: function (toggle) {
      for (let x of this.tasks) {
        x.checked = toggle
      }
      this.allChecked = toggle;
    },
    deleteCompletedTasks: function () {
      this.tasks = this.tasks.filter((x) => !x.checked);
    },
    resetToInitialState: function () {
      clearInterval(this.timerFunctionId);
      Object.assign(this,{
        currentTimerLabel: "session",
        controlsLocked: false,
        elapsedSeconds: 0,
        timerRunning: false,
        timerMinutes: { break: 5, session: 25 },
        timerFunctionId: 0,
      });
      this.$refs.audio.pause();
      this.$refs.audio.currentTime = 0;
    }
  },
  computed: {
    timeLeft: function () {
      let timeRemaining =
        this.timerMinutes[this.timerLabel] * 60000 - this.elapsedSeconds;
      let minutes = parseInt(timeRemaining / 60000);
      let seconds = parseInt(timeRemaining % 60000) / 1000;
      return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    },
    timerLabel: function () {
      return this.currentTimerLabel;
    },
  },
});
