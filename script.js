document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentDate = new Date();
    let selectedDate = new Date();
    
    // DOM elements
    const currentDateElement = document.getElementById('current-date');
    const newTodoInput = document.getElementById('new-todo');
    const addTodoButton = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const monthYearElement = document.getElementById('month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const calendarElement = document.getElementById('calendar');
    const quickNoteInput = document.getElementById('quick-note-input');
    const saveNoteButton = document.getElementById('save-note');
    
    // Initialize the app
    updateDateDisplay();
    renderCalendar();
    renderTodos();
    loadQuickNote();
    
    // Event listeners
    addTodoButton.addEventListener('click', addTodo);
    newTodoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    saveNoteButton.addEventListener('click', saveQuickNote);
    
    // 엔터키 이벤트 핸들러 제거하고 Ctrl+Enter로 저장되도록 수정
    quickNoteInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            saveQuickNote();
            e.preventDefault();
        }
    });
    
    // Functions
    function updateDateDisplay() {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        currentDateElement.textContent = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${getDayName(selectedDate.getDay())} ${formatTime(selectedDate)}`;
    }
    
    function getDayName(dayIndex) {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return days[dayIndex];
    }
    
    function formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // 날짜를 항상 로컬 기준 YYYY-MM-DD로 반환
    function getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function renderCalendar() {
        // Update month and year display
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        monthYearElement.textContent = `${currentDate.getFullYear()}년 ${monthNames[currentDate.getMonth()]}`;
        
        // Clear calendar
        calendarElement.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get days with todos and notes
        const daysWithContent = getDaysWithContent(currentDate.getFullYear(), currentDate.getMonth());
        
        // Add empty cells for days before first day of month
        let dayOfWeek = firstDay.getDay();
        for (let i = 0; i < dayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarElement.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            
            // Create date string for this day (로컬 기준)
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const dateStr = getLocalDateString(dateObj);
            
            // Add indicator if this day has content
            if (daysWithContent.includes(dateStr)) {
                const indicator = document.createElement('div');
                indicator.classList.add('content-indicator');
                dayElement.appendChild(indicator);
            }
            
            const dayNumber = document.createElement('span');
            dayNumber.textContent = i;
            dayElement.appendChild(dayNumber);
            
            // Check if this day is today
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const today = new Date();
            
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Check if this day is selected
            if (currentYear === selectedDate.getFullYear() && 
                currentMonth === selectedDate.getMonth() && 
                i === selectedDate.getDate()) {
                dayElement.classList.add('selected');
            }
            
            // Add click event to select a day
            dayElement.addEventListener('click', () => {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                updateDateDisplay();
                renderCalendar();
                renderTodos();
                // loadQuickNote() 함수 호출 제거 - 날짜 변경 시 메모가 바뀌지 않도록
            });
            
            calendarElement.appendChild(dayElement);
        }
    }
    
    // 기록이 있는 날짜 찾기
    function getDaysWithContent(year, month) {
        const daysWithContent = [];
        
        // 해당 월의 모든 날짜 확인
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateStr = getLocalDateString(date); // 여기서 date로 변경
            
            // 해당 날짜에 할 일이 있는지 확인
            const hasTodos = todos.some(todo => todo.date === dateStr);
            
            // 할 일이 있으면 배열에 추가
            if (hasTodos) {
                daysWithContent.push(dateStr);
            }
        }
        
        return daysWithContent;
    }
    
    function addTodo() {
        const todoText = newTodoInput.value.trim();
        if (todoText) {
            // 기존: const dateStr = selectedDate.toISOString().split('T')[0];
            const dateStr = getLocalDateString(selectedDate);
            
            const todo = {
                id: Date.now(),
                text: todoText,
                date: dateStr,
                completed: false
            };
            
            todos.push(todo);
            saveTodos();
            newTodoInput.value = '';
            renderTodos();
            renderCalendar(); // Re-render calendar to update indicators
        }
    }
    
    function renderTodos() {
        todoList.innerHTML = '';
        
        // 기존: const selectedDateStr = selectedDate.toISOString().split('T')[0];
        const selectedDateStr = getLocalDateString(selectedDate);
        const filteredTodos = todos.filter(todo => todo.date === selectedDateStr);
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<p>할 일이 없습니다.</p>';
            return;
        }
        
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                toggleTodoComplete(todo.id);
            });
            
            const todoText = document.createElement('span');
            todoText.classList.add('todo-text');
            todoText.textContent = todo.text;
            if (todo.completed) {
                todoText.style.textDecoration = 'line-through';
            }
            
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('todo-actions');
            
            const editButton = document.createElement('button');
            editButton.classList.add('edit');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                editTodo(todo.id);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                deleteTodo(todo.id);
            });
            
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            
            todoItem.appendChild(checkbox);
            todoItem.appendChild(todoText);
            todoItem.appendChild(actionsDiv);
            
            todoList.appendChild(todoItem);
        });
    }
    
    function toggleTodoComplete(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        saveTodos();
        renderTodos();
        renderCalendar(); // Re-render calendar to update indicators
    }
    
    function deleteTodo(id) {
        if (confirm('이 할 일을 삭제하시겠습니까?')) {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
            renderCalendar(); // Re-render calendar to update indicators
        }
    }
    
    // 메모 관련 코드 수정
    function saveQuickNote() {
        const noteText = quickNoteInput.value.trim();
        const previousNote = localStorage.getItem('quickNote') || '';
        
        try {
            // 메모를 단일 항목으로 저장 (날짜와 무관하게)
            localStorage.setItem('quickNote', noteText);
            
            // 내용이 변경된 경우에만 알림 표시
            if (noteText !== previousNote) {
                alert('메모가 저장되었습니다!');
            }
        } catch (e) {
            console.error('메모 저장 실패:', e);
            alert('메모 저장에 실패했습니다.');
        }
    }
    
    function loadQuickNote() {
        try {
            // 저장된 단일 메모 불러오기
            const savedNote = localStorage.getItem('quickNote');
            if (savedNote) {
                quickNoteInput.value = savedNote;
            }
            
            // textarea 높이 자동 조절
            quickNoteInput.style.height = 'auto';
            quickNoteInput.style.height = (quickNoteInput.scrollHeight) + 'px';
        } catch (e) {
            console.error('메모 로드 실패:', e);
        }
    }
    
    // textarea 자동 높이 조절
    quickNoteInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // 초기 로드 시 메모 불러오기
    loadQuickNote();
    
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Update time every second
    setInterval(() => {
        const now = new Date();
        // Only update the time part, not the date
        if (selectedDate.getDate() === now.getDate() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getFullYear() === now.getFullYear()) {
            // Create a new date with the same date but updated time
            const updatedDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );
            selectedDate = updatedDate;
            updateDateDisplay();
        }
    }, 1000);
});