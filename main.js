const audio = new Audio(
  "https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
);

const MAX_MINUTES = 60,
  MIN_MINUTES = 1;

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
    cancel: cancel,
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

    <button class='icon-button task-button' @click='$emit("task-checkbox-updated",index)'>
      <i :class="['far', isChecked?'fa-check-square':'fa-square']"></i>
    </button>


        <div v-if='editing' class="rounded-white-border task-text" contentEditable ref='task' @blur='editing=false; $emit("task-text-changed", [$event.target.innerText, index])' @keydown.enter="$event.target.blur()">{{ taskText }}
        </div>
        <div v-else class=task-text><span :class='isChecked? "strike" : ""' :style='transitionStyle' @blur='editing=false; $emit("task-text-changed", [$event.target.innerText, index])' @keydown.enter="$event.target.blur()" :contentEditable='editing'>{{ taskText }}</span></div>


    <button @click="editTask" :class='[isChecked ? "hidden" : "","task-button", "icon-button"]'>
      <i class="far fa-edit fa-fw"></i>
    </button>


    <button @click='$emit("remove-task", index)' class="task-button icon-button">
      <i class="far fa-times-circle fa-fw"></i>
</button>
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
    transitionStyle: function () {
      let factor = !this.isChecked ? 1 : 10;
      return (
        "transition: background-size " +
        Math.min(this.taskText.length * factor, 2000) +
        "ms linear"
      );
    },
  },
});

Vue.component("timer-adjuster", {
  props: ["current-timer-label", "timer-to-adjust", "length", "timer-running"],
  template: `
  <div class='control'>
    <h2 :id='timerToAdjust + "-label"' class='control-label'>{{ timerToAdjust }} Minutes</h2>
    <div :class='[timerRunning ? "hide-controls" : "","number-incrementer", "rounded-white-border", "control-box"]'>
    
      <button :id='timerToAdjust + "-decrement"' @click='$emit("decrement")' :disabled="timerRunning" class='icon-button'>
      <i class="fa fa-minus"></i>
      </button>

      <input maxlength='2' class="length-input number dynamic-background" :id='timerToAdjust + "-length"' v-model:value='length' @input='validateInput($event.target.value)' @change='validateTimerLength($event.target.value)' :disabled="timerRunning">

      <button :id='timerToAdjust + "-increment"' @click='$emit("increment")' :disabled="timerRunning" class='icon-button'>
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
  template:`<div id="app">
    <div id="grid-container">
    <div id="branding">
      <img src="images/logo.svg" id='persimmon-icon'>
      <h1 id=title>Persimmon Timer</h1>
    </div>
  
    <div
      :class="['rounded-white-border',showSettings ? 'show-settings' : 'hide-settings']"
      id=timer-and-settings-container
    >
      <div class="timer dynamic-background">
        <div class="timer-label">
          <h1 class="timer-label" id="timer-label">{{ timerLabel }}</h1>
        </div>
        <div class="timer-time-remaining">
          <h1 class="time-left number" id="time-left">{{ timeLeft }}</h1>
        </div>
        <div class="control-box" id="timer-controls">
          <button
            class="icon-button-large"
            id="start_stop"
            @click="startTimer"
          >
            <h4 :class="['fa', timerRunning ? 'fa-pause' : 'fa-play']"></h4>
          </button>
          <button
            class="icon-button-large"
            id="reset"
            @click="resetToInitialState"
          >
            <h4 class="fa fa-undo"></h4>
          </button>
        </div>
      </div>
      <!--end-timer-->
      <div class="timer-settings">
        <timer-adjuster
          :timer-running="timerRunning"
          :current-timer-label="currentTimerLabel"
          timer-to-adjust="session"
          :length="timerMinutes.session"
          @set-timer="setTimer"
          @increment="adjustTimerLength(1, 'session')"
          @decrement="adjustTimerLength(-1, 'session')"
        ></timer-adjuster>
        <timer-adjuster
          :timer-running="timerRunning"
          :current-timer-label="currentTimerLabel"
          timer-to-adjust="break"
          :length="timerMinutes.break"
          @set-timer="setTimer"
          @increment="adjustTimerLength(1, 'break')"
          @decrement="adjustTimerLength(-1, 'break')"
        ></timer-adjuster>
        <div class="control" id='volume-control'>
          <h2 class='control-label'>Alarm Volume</h2>
  
          <div class="control-box">
            <button @click="incrementVolume(-0.1)" class='icon-button'>
              <i class="fa fa-volume-down"></i>
            </button>
            <input
              type="range"
              name="volume-slider"
              id="volume-slider"
              class="volume-slider dynamic-background"
              max="1"
              min="0"
              step=".001"
              @input="adjustVolume()"
              v-model="alarmVolume"
            />
            <button @click="incrementVolume(0.1)" class='icon-button'>
              <i class="fa fa-volume-up volume-icon"></i>
            </button>
          </div>
        </div>
      </div>
      <button
        class="text-button rounded-white-border"
        id="show-settings-button"
        @click="showSettings=!showSettings"
        tabindex="0"
      >
      <p><i :class='["fa", showSettings ? "fa-minus" : "fa-plus"]'></i
        >&nbsp;Settings</p>
      </button>
    </div>
    <audio id="beep" ref="audio">
      <source
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        type="audio/wav"
      />
    </audio>
    <div class="task-area">
      <h2>Tasks</h2>
  
      <div class="control-box" id='task-list-entry'>
        <input
          class="dynamic-background"
          id="task-input"
          v-model:value="taskEntry"
          placeholder="Enter a new task and add with the '+' button."
          @keydown.enter="addTask"
        />
        <button @click="addTask" class="icon-button"> 
          <i class="fa fa-plus"></i>
        </button>
      </div>
      <div class="table-border rounded-white-border">
        <div class="task-columns">
          <div class="task-row" id="task-header">
            <button class='icon-button' @click="toggleAll(!allChecked)" title="Mark all tasks complete">
                <i
                  :class="['far', !allChecked ? 'fa-square' : 'fa-check-square', 'fa-fw']"
                ></i>
            </button>
            <div>Task</div>
          </div>
          <task-entry
            class="task-row task fade-in"
            v-for="(task, index) in tasks"
            :index="index"
            :key="index"
            :current-timer="currentTimerLabel"
            :is-checked="task.checked"
            :task-text="task.text"
            @remove-task="removeTask"
            @task-checkbox-updated="updateTaskCheckedStatus"
            @task-text-changed="updateTaskText(...arguments)"
          >
          </task-entry>
        </div>
      </div>
      <div class="task-list-controls">
        <button
          @click="deleteCompletedTasks"
          class="rounded-white-border text-button"
          title="Delete Completed Tasks"
          tabindex="0"
        >
        <p><i class="fa fa-broom fa-fw"></i>&nbsp;Delete Completed</p></button>
        <button 
          class="rounded-white-border text-button"
          @click="tasks=[]"
          title="Delete All Tasks"
          tabindex="0">
          <p><i class="fas fa-trash fa-fw"></i>&nbsp;Delete All</p>
        </button>
      </div>
    </div>
  </div>
  </div>`,
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
    showTaskOptions: false,
  },
  mounted: function () {
    this.root = document.documentElement;
    this.root.style.setProperty(
      "--current-color",
      "var(--" + this.currentTimerLabel + ")"
    );
    this.root.style.setProperty(
      "--current-color-light",
      "var(--" + this.currentTimerLabel + "-light)"
    );
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
        this.timerFunctionId = setInterval(this.countDown, 1000);
        this.timerRunning = true;
      } else {
        clearInterval(this.timerFunctionId);
        this.timerRunning = false;
      }
    },
    debugSwapColors: function () {
      this.currentTimerLabel =
        this.currentTimerLabel == "session" ? "break" : "session";
      this.root.style.setProperty(
        "--current-color",
        "var(--" + this.currentTimerLabel + ")"
      );
      this.root.style.setProperty(
        "--current-color-light",
        "var(--" + this.currentTimerLabel + "-light)"
      );
      this.elapsedSeconds = 1000;
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
        this.root.style.setProperty(
          "--current-color",
          "var(--" + this.currentTimerLabel + ")"
        );
        this.root.style.setProperty(
          "--current-color-light",
          "var(--" + this.currentTimerLabel + "-light)"
        );
        this.elapsedSeconds = 1000;
      }
    },
    adjustVolume: function () {
      this.$refs.audio.volume = this.alarmVolume;
      this.playAlarm();
    },
    incrementVolume: function (amount) {
      this.alarmVolume = Math.min(
        Math.max(parseFloat(this.alarmVolume) + amount, 0),
        1
      );
      this.adjustVolume();
    },
    setTimer: function (args) {
      this.timerMinutes[args[0]] = args[1];
      this.elapsedSeconds = 0;
    },
    playAlarm: function () {
      this.$refs.audio.play();
    },
    addTask: function () {
      if (this.taskEntry) {
        this.tasks.push({ text: this.taskEntry, checked: false });
        this.taskEntry = "";
      }
    },
    removeTask: function (index) {
      this.tasks.splice(index, 1);
    },
    updateTaskText: function ([text, index]) {
      this.tasks[index].text = text;
    },
    updateTaskCheckedStatus: function (index) {
      this.tasks[index].checked = !this.tasks[index].checked;
      this.allChecked = false;
    },
    toggleAll: function (toggle) {
      for (let x of this.tasks) {
        x.checked = toggle;
      }
      this.allChecked = toggle;
    },
    deleteCompletedTasks: function () {
      this.tasks = this.tasks.filter((x) => !x.checked);
    },
    resetToInitialState: function () {
      clearInterval(this.timerFunctionId);
      Object.assign(this, {
        currentTimerLabel: "session",
        controlsLocked: false,
        elapsedSeconds: 0,
        timerRunning: false,
        timerMinutes: { break: 5, session: 25 },
        timerFunctionId: 0,
      });
      this.$refs.audio.pause();
      this.$refs.audio.currentTime = 0;
    },
  },
  computed: {
    timeLeft: function () {
      let timeRemaining =
        this.timerMinutes[this.timerLabel] * 60000 - this.elapsedSeconds;
      let minutes = parseInt(timeRemaining / 60000);
      let seconds = parseInt(timeRemaining % 60000) / 1000;
      return (
        (minutes < 10 ? "0" : "") +
        minutes +
        ":" +
        (seconds < 10 ? "0" : "") +
        seconds
      );
    },
    timerLabel: function () {
      return this.currentTimerLabel;
    },
  },
});
