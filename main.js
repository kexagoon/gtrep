// Bad Bluetooth Script Builder - Main JavaScript

// Глобальные переменные
let scriptCommands = [];
let commandIdCounter = 0;
let draggedElement = null;
let editingCommandId = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initBackgroundAnimation();
    initTabs();
    loadScriptFromStorage();
    updateCommandCount();
});

// Анимация фона
function initBackgroundAnimation() {
    const canvas = document.getElementById('background-canvas');
    const app = new PIXI.Application({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x0a0e1a,
        antialias: true
    });

    // Создание сетки
    const gridGraphics = new PIXI.Graphics();
    app.stage.addChild(gridGraphics);

    function drawGrid() {
        gridGraphics.clear();
        gridGraphics.lineStyle(1, 0x2a3f5f, 0.3);
        
        const gridSize = 40;
        const width = app.screen.width;
        const height = app.screen.height;
        
        // Вертикальные линии
        for (let x = 0; x <= width; x += gridSize) {
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, height);
        }
        
        // Горизонтальные линии
        for (let y = 0; y <= height; y += gridSize) {
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(width, y);
        }
    }

    // Анимированные точки
    const dots = [];
    for (let i = 0; i < 50; i++) {
        const dot = new PIXI.Graphics();
        dot.beginFill(0x00d4ff, Math.random() * 0.5 + 0.2);
        dot.drawCircle(0, 0, Math.random() * 2 + 1);
        dot.endFill();
        
        dot.x = Math.random() * app.screen.width;
        dot.y = Math.random() * app.screen.height;
        dot.vx = (Math.random() - 0.5) * 0.5;
        dot.vy = (Math.random() - 0.5) * 0.5;
        
        app.stage.addChild(dot);
        dots.push(dot);
    }

    // Анимация
    app.ticker.add(() => {
        dots.forEach(dot => {
            dot.x += dot.vx;
            dot.y += dot.vy;
            
            if (dot.x < 0 || dot.x > app.screen.width) dot.vx *= -1;
            if (dot.y < 0 || dot.y > app.screen.height) dot.vy *= -1;
            
            dot.alpha = 0.2 + Math.sin(Date.now() * 0.001 + dot.x * 0.01) * 0.3;
        });
    });

    drawGrid();
    
    // Обработка изменения размера
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        drawGrid();
    });
}

// Инициализация вкладок
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Убрать активный класс у всех вкладок и контента
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Добавить активный класс текущей вкладке и контенту
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const contentElement = document.getElementById(tabId);
            if (contentElement) {
                contentElement.classList.add('active');
                
                // Быстрая анимация без задержек
                contentElement.style.opacity = '0';
                contentElement.style.transform = 'translateY(10px)';
                contentElement.style.transition = 'all 0.2s ease';
                
                setTimeout(() => {
                    contentElement.style.opacity = '1';
                    contentElement.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });
}

// Визуальная обратная связь на кнопки
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики на все кнопки команд
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('command-btn')) {
            // Визуальная обратная связь
            e.target.style.background = 'var(--accent-primary)';
            e.target.style.color = 'var(--bg-primary)';
            setTimeout(() => {
                e.target.style.background = '';
                e.target.style.color = '';
            }, 200);
        }
    });
});

// Добавление команды
function addCommand(type, value, description) {
    try {
        const command = {
            id: commandIdCounter++,
            type: type,
            value: value,
            description: description,
            parameters: {}
        };
        
        // Для текстовых команд открыть окно редактирования
        if (type === 'text' || type === 'rem') {
            openEditModal(command);
            return;
        }
        
        scriptCommands.push(command);
        renderCommands();
        saveScriptToStorage();
        updateCommandCount();
        
        // Обратная связь
        showNotification(`Добавлено: ${description}`);
        
        console.log(`Command added: ${value}`);
        
    } catch (error) {
        console.error('Error adding command:', error);
        showNotification('Ошибка добавления команды', 'error');
    }
}

// Добавление быстрой команды
function addQuickCommand(type) {
    const quickCommands = {
        cmd: [
            { type: 'combo', value: 'GUI+R', description: 'Win+R' },
            { type: 'text', value: 'cmd', description: 'cmd' },
            { type: 'key', value: 'ENTER', description: 'Enter' }
        ],
        powershell: [
            { type: 'combo', value: 'GUI+R', description: 'Win+R' },
            { type: 'text', value: 'powershell', description: 'powershell' },
            { type: 'key', value: 'ENTER', description: 'Enter' }
        ],
        browser: [
            { type: 'combo', value: 'GUI+R', description: 'Win+R' },
            { type: 'text', value: 'chrome', description: 'chrome' },
            { type: 'key', value: 'ENTER', description: 'Enter' }
        ],
        notepad: [
            { type: 'combo', value: 'GUI+R', description: 'Win+R' },
            { type: 'text', value: 'notepad', description: 'notepad' },
            { type: 'key', value: 'ENTER', description: 'Enter' }
        ],
        taskmanager: [
            { type: 'combo', value: 'CTRL+SHIFT+ESC', description: 'Ctrl+Shift+Esc' }
        ],
        desktop: [
            { type: 'combo', value: 'GUI+D', description: 'Win+D' }
        ],
        lock: [
            { type: 'combo', value: 'GUI+L', description: 'Win+L' }
        ],
        shutdown: [
            { type: 'combo', value: 'GUI+R', description: 'Win+R' },
            { type: 'text', value: 'shutdown /s /t 0', description: 'shutdown' },
            { type: 'key', value: 'ENTER', description: 'Enter' }
        ]
    };
    
    const commands = quickCommands[type] || [];
    commands.forEach(cmd => {
        scriptCommands.push({
            id: commandIdCounter++,
            ...cmd,
            parameters: {}
        });
    });
    
    renderCommands();
    saveScriptToStorage();
    updateCommandCount();
    showNotification(`Добавлен быстрый набор: ${type}`);
}

// Добавление команды задержки
function addSleepCommand() {
    const command = {
        id: commandIdCounter++,
        type: 'sleep',
        value: '1000',
        description: 'Задержка 1000ms',
        parameters: { delay: '1000' }
    };
    
    openEditModal(command);
}

// Быстрое добавление задержки
function addDelay(milliseconds) {
    try {
        const command = {
            id: commandIdCounter++,
            type: 'sleep',
            value: milliseconds,
            description: `Задержка ${milliseconds}ms`,
            parameters: { delay: milliseconds }
        };
        
        scriptCommands.push(command);
        renderCommands();
        saveScriptToStorage();
        updateCommandCount();
        
        // Визуальная обратная связь
        anime({
            targets: '#commands-list .command-card:last-child',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
        
        showNotification(`Добавлена задержка: ${milliseconds}ms`);
    } catch (error) {
        console.error('Error adding delay:', error);
        showNotification('Ошибка добавления задержки', 'error');
    }
}

// Отрисовка команд
function renderCommands() {
    const container = document.getElementById('commands-list');
    
    if (scriptCommands.length === 0) {
        container.innerHTML = '<div class="empty-state">Начните добавлять команды из панели внизу</div>';
        return;
    }
    
    container.innerHTML = scriptCommands.map((cmd, index) => `
        <div class="command-card" data-id="${cmd.id}" draggable="true">
            <div class="command-icon">${getCommandIcon(cmd.type, cmd.value)}</div>
            <div class="command-content">
                <div class="command-name">${getCommandDisplayName(cmd)}</div>
                <div class="command-desc">${cmd.description}</div>
            </div>
            <div class="command-actions">
                <button class="action-btn edit-btn" onclick="editCommand('${cmd.id}')">✏</button>
                <button class="action-btn delete-btn" onclick="deleteCommand('${cmd.id}')">🗑</button>
            </div>
        </div>
    `).join('');
    
    // Добавление обработчиков перетаскивания
    addDragAndDropHandlers();
}

// Получение иконки команды
function getCommandIcon(type, value) {
    const icons = {
        key: value.length === 1 ? value : '⌨',
        modifier: '⌃',
        combo: '⚡',
        text: 'T',
        sleep: '⏱',
        rem: '#'
    };
    return icons[type] || '⌨';
}

// Получение отображаемого имени команды
function getCommandDisplayName(cmd) {
    if (cmd.type === 'sleep') {
        return `SLEEP ${cmd.parameters.delay}ms`;
    }
    if (cmd.type === 'text' && cmd.parameters.text) {
        return `STRING "${cmd.parameters.text}"`;
    }
    if (cmd.type === 'rem' && cmd.parameters.text) {
        return `REM ${cmd.parameters.text}`;
    }
    return cmd.value;
}

// Обработчики перетаскивания
function addDragAndDropHandlers() {
    const cards = document.querySelectorAll('.command-card');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedElement = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedElement = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedElement && draggedElement !== card) {
                const draggedId = parseInt(draggedElement.getAttribute('data-id'));
                const targetId = parseInt(card.getAttribute('data-id'));
                reorderCommands(draggedId, targetId);
            }
        });
    });
}

// Изменение порядка команд
function reorderCommands(draggedId, targetId) {
    const draggedIndex = scriptCommands.findIndex(cmd => cmd.id === draggedId);
    const targetIndex = scriptCommands.findIndex(cmd => cmd.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedCommand] = scriptCommands.splice(draggedIndex, 1);
        scriptCommands.splice(targetIndex, 0, draggedCommand);
        renderCommands();
        saveScriptToStorage();
        showNotification('Порядок изменён');
    }
}

// Редактирование команды
function editCommand(id) {
    const command = scriptCommands.find(cmd => cmd.id === parseInt(id));
    if (command) {
        openEditModal(command);
    }
}

// Удаление команды
function deleteCommand(id) {
    // Используем простой способ подтверждения для мобильных устройств
    if (window.confirm('Удалить эту команду?')) {
        scriptCommands = scriptCommands.filter(cmd => cmd.id !== parseInt(id));
        renderCommands();
        saveScriptToStorage();
        updateCommandCount();
        showNotification('Команда удалена');
    }
}

// Очистка скрипта
function clearScript() {
    console.log('clearScript called, current commands:', scriptCommands.length);
    
    if (scriptCommands.length === 0) {
        showNotification('Скрипт уже пуст');
        return;
    }
    
    try {
        if (window.confirm('Очистить весь скрипт?')) {
            scriptCommands = [];
            renderCommands();
            saveScriptToStorage();
            updateCommandCount();
            showNotification('Скрипт очищен');
            console.log('Script cleared successfully');
        } else {
            console.log('Clear cancelled by user');
        }
    } catch (error) {
        console.error('Error in clearScript:', error);
        showNotification('Ошибка очистки', 'error');
    }
}

// Полный сброс приложения
function resetApp() {
    try {
        if (window.confirm('Сбросить приложение полностью?\n\nЭто удалит ВСЕ сохраненные скрипты и перезагрузит страницу.')) {
            console.log('Сброс подтвержден');
            
            // Очищаем LocalStorage
            localStorage.removeItem('bt-script-builder');
            console.log('✓ LocalStorage очищен');
            
            // Очищаем текущий скрипт
            scriptCommands = [];
            commandIdCounter = 0;
            renderCommands();
            updateCommandCount();
            
            showNotification('Приложение сброшено. Перезагрузка...');
            
            // Перезагружаем страницу через 2 секунды
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } else {
            console.log('Сброс отменен');
        }
    } catch (error) {
        console.error('Error in resetApp:', error);
        showNotification('Ошибка сброса', 'error');
    }
}

// Обновление счётчика команд
function updateCommandCount() {
    document.getElementById('command-count').textContent = scriptCommands.length;
}

// Открытие модального окна экспорта
function openExportModal() {
    if (scriptCommands.length === 0) {
        showNotification('Добавьте команды перед экспортом', 'error');
        return;
    }
    
    generateScript();
    document.getElementById('exportModal').classList.add('active');
    
    // Обработчики выбора формата
    document.querySelectorAll('.format-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            generateScript();
        });
    });
}

// Закрытие модального окна экспорта
function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

// Генерация скрипта
function generateScript() {
    const selectedFormat = document.querySelector('.format-option.selected').getAttribute('data-format');
    let script = '';
    
    switch (selectedFormat) {
        case 'ducky':
            script = generateDuckyScript();
            break;
        case 'enhanced':
            script = generateEnhancedDuckyScript();
            break;
        case 'flipper':
            script = generateFlipperScript();
            break;
        case 'esp32':
            script = generateESP32Script();
            break;
    }
    
    document.getElementById('codeOutput').textContent = script;
}

// Генерация DuckyScript
function generateDuckyScript() {
    let script = 'REM ==========================================\n';
    script += 'REM Bad Bluetooth Script Builder\n';
    script += 'REM Generated: ' + new Date().toLocaleString() + '\n';
    script += 'REM ==========================================\n\n';
    
    scriptCommands.forEach((cmd, index) => {
        switch (cmd.type) {
            case 'key':
                script += `${cmd.value}\n`;
                break;
            case 'modifier':
                script += `${cmd.value}\n`;
                break;
            case 'combo':
                const keys = cmd.value.split('+');
                script += `${keys.join(' ')}\n`;
                break;
            case 'text':
                if (cmd.parameters.text) {
                    script += `STRING ${cmd.parameters.text}\n`;
                }
                break;
            case 'sleep':
                script += `DELAY ${cmd.parameters.delay || '1000'}\n`;
                break;
            case 'rem':
                if (cmd.parameters.text) {
                    script += `REM ${cmd.parameters.text}\n`;
                }
                break;
        }
    });
    
    script += '\nREM ==========================================\n';
    script += 'REM Конец скрипта\n';
    script += 'REM ==========================================';
    
    return script;
}

// Генерация улучшенного DuckyScript с комментариями
function generateEnhancedDuckyScript() {
    let script = 'REM ==========================================\n';
    script += 'REM Bad Bluetooth Script Builder\n';
    script += 'REM Enhanced DuckyScript\n';
    script += 'REM Generated: ' + new Date().toLocaleString() + '\n';
    script += 'REM ==========================================\n\n';
    
    let stepNumber = 1;
    scriptCommands.forEach((cmd, index) => {
        switch (cmd.type) {
            case 'key':
                script += `REM Шаг ${stepNumber}: Нажатие клавиши ${cmd.value}\n`;
                script += `${cmd.value}\n\n`;
                stepNumber++;
                break;
            case 'modifier':
                script += `REM Шаг ${stepNumber}: Модификатор ${cmd.value}\n`;
                script += `${cmd.value}\n\n`;
                stepNumber++;
                break;
            case 'combo':
                script += `REM Шаг ${stepNumber}: Комбинация ${cmd.value}\n`;
                const keys = cmd.value.split('+');
                script += `${keys.join(' ')}\n\n`;
                stepNumber++;
                break;
            case 'text':
                if (cmd.parameters.text) {
                    script += `REM Шаг ${stepNumber}: Ввод текста\n`;
                    script += `STRING ${cmd.parameters.text}\n\n`;
                    stepNumber++;
                }
                break;
            case 'sleep':
                const delayMs = cmd.parameters.delay || '1000';
                const delaySec = (parseInt(delayMs) / 1000).toFixed(1);
                script += `REM Шаг ${stepNumber}: Задержка ${delaySec} сек (${delayMs}ms)\n`;
                script += `DELAY ${delayMs}\n\n`;
                stepNumber++;
                break;
            case 'rem':
                if (cmd.parameters.text) {
                    script += `REM ${cmd.parameters.text}\n`;
                }
                break;
        }
    });
    
    script += '\nREM ==========================================\n';
    script += 'REM Конец скрипта\n';
    script += 'REM Всего шагов: ' + (stepNumber - 1) + '\n';
    script += 'REM ==========================================';
    
    return script;
}

// Генерация Flipper Zero скрипта
function generateFlipperScript() {
    let script = '// Bad Bluetooth Script Builder\n';
    script += '// Generated for Flipper Zero BadUSB\n\n';
    
    scriptCommands.forEach(cmd => {
        switch (cmd.type) {
            case 'key':
                script += `press("${cmd.value}")\n`;
                break;
            case 'modifier':
                script += `press("${cmd.value}")\n`;
                break;
            case 'combo':
                const keys = cmd.value.split('+');
                if (keys.length === 2) {
                    script += `hold("${keys[0]}") + press("${keys[1]}")\n`;
                } else {
                    script += `press("${cmd.value}")\n`;
                }
                break;
            case 'text':
                if (cmd.parameters.text) {
                    script += `print("${cmd.parameters.text}")\n`;
                }
                break;
            case 'sleep':
                script += `delay(${cmd.parameters.delay || '1000'})\n`;
                break;
            case 'rem':
                if (cmd.parameters.text) {
                    script += `// ${cmd.parameters.text}\n`;
                }
                break;
        }
    });
    
    return script;
}

// Генерация ESP32 скрипта
function generateESP32Script() {
    let script = '// Bad Bluetooth Script Builder\n';
    script += '// Generated for ESP32 BLE Keyboard\n\n';
    script += '#include <BleKeyboard.h>\n\n';
    script += 'BleKeyboard bleKeyboard;\n\n';
    script += 'void setup() {\n';
    script += '  bleKeyboard.begin();\n';
    script += '}\n\n';
    script += 'void loop() {\n';
    script += '  if (bleKeyboard.isConnected()) {\n';
    
    scriptCommands.forEach(cmd => {
        switch (cmd.type) {
            case 'key':
                script += `    bleKeyboard.write(KEY_${cmd.value});\n`;
                break;
            case 'modifier':
                script += `    bleKeyboard.press(KEY_${cmd.value});\n`;
                break;
            case 'combo':
                const keys = cmd.value.split('+');
                if (keys.length === 2) {
                    script += `    bleKeyboard.press(KEY_${keys[0]});\n`;
                    script += `    bleKeyboard.write(KEY_${keys[1]});\n`;
                    script += `    bleKeyboard.releaseAll();\n`;
                }
                break;
            case 'text':
                if (cmd.parameters.text) {
                    script += `    bleKeyboard.print("${cmd.parameters.text}");\n`;
                }
                break;
            case 'sleep':
                script += `    delay(${cmd.parameters.delay || '1000'});\n`;
                break;
            case 'rem':
                if (cmd.parameters.text) {
                    script += `    // ${cmd.parameters.text}\n`;
                }
                break;
        }
    });
    
    script += '  }\n';
    script += '  delay(1000);\n';
    script += '}';
    
    return script;
}

// Копирование скрипта
function copyScript() {
    const codeOutput = document.getElementById('codeOutput');
    const text = codeOutput.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.textContent = '✓ Скопировано!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Скопировать';
            copyBtn.classList.remove('copied');
        }, 2000);
        
        showNotification('Скрипт скопирован в буфер обмена');
    }).catch(() => {
        showNotification('Ошибка копирования', 'error');
    });
}

// Открытие модального окна редактирования
function openEditModal(command) {
    editingCommandId = command.id;
    
    document.getElementById('editType').value = command.type;
    document.getElementById('editText').value = command.parameters.text || '';
    document.getElementById('editDelay').value = command.parameters.delay || '1000';
    
    // Показать/скрыть поля в зависимости от типа
    const textGroup = document.getElementById('textEditGroup');
    const delayGroup = document.getElementById('delayEditGroup');
    
    if (command.type === 'sleep') {
        textGroup.style.display = 'none';
        delayGroup.style.display = 'block';
    } else if (command.type === 'text' || command.type === 'rem') {
        textGroup.style.display = 'block';
        delayGroup.style.display = 'none';
    }
    
    document.getElementById('editModal').classList.add('active');
}

// Закрытие модального окна редактирования
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    editingCommandId = null;
}

// Сохранение редактирования
function saveEdit() {
    if (editingCommandId === null) return;
    
    const command = scriptCommands.find(cmd => cmd.id === editingCommandId);
    if (!command) return;
    
    const type = document.getElementById('editType').value;
    
    if (type === 'sleep') {
        const delay = document.getElementById('editDelay').value;
        command.parameters.delay = delay;
        command.value = delay;
        command.description = `Задержка ${delay}ms`;
    } else if (type === 'text' || type === 'rem') {
        const text = document.getElementById('editText').value;
        command.parameters.text = text;
        command.description = type === 'text' ? `Текст: ${text}` : `Комментарий: ${text}`;
    }
    
    renderCommands();
    saveScriptToStorage();
    closeEditModal();
    showNotification('Команда обновлена');
}

// Показ уведомления
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    if (type === 'error') {
        notification.style.background = '#ff6b35';
    } else {
        notification.style.background = '#00ff88';
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Сохранение в локальное хранилище
function saveScriptToStorage() {
    localStorage.setItem('bt-script-builder', JSON.stringify(scriptCommands));
}

// Загрузка из локального хранилища
function loadScriptFromStorage() {
    const saved = localStorage.getItem('bt-script-builder');
    if (saved) {
        try {
            scriptCommands = JSON.parse(saved);
            commandIdCounter = Math.max(...scriptCommands.map(cmd => cmd.id), 0) + 1;
            renderCommands