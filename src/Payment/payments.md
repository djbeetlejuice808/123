const autoClicker = {
clickCount: 0,
successCount: 0,
failCount: 0,
minDelay: 1000,
maxDelay: 2000,
intervalId: null,
isRunning: false,
startTime: null,

    // Các phương thức findFrog giữ nguyên như cũ
    findFrog() {
        const searchMethods = [
            () => document.evaluate(
                '//*[@title="frogLottieAnim"]',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue,
            () => document.querySelector('[title="frogLottieAnim"]'),
            () => document.querySelector('.frog-element'),
            () => document.querySelector('[data-test-id="frog"]'),
            () => document.querySelector('div[role="button"][aria-label*="frog"]'),
            () => {
                const containers = document.querySelectorAll('.game-container');
                for (const container of containers) {
                    const frogElement = container.querySelector('[title*="frog"]');
                    if (frogElement) return frogElement;
                }
                return null;
            },
            () => {
                const elements = document.querySelectorAll('*');
                for (const element of elements) {
                    if (element.innerHTML.toLowerCase().includes('frog')) {
                        return element;
                    }
                }
                return null;
            }
        ];

        for (const method of searchMethods) {
            try {
                const element = method();
                if (element) {
                    console.log('Tìm thấy ếch bằng phương thức:', method.toString().slice(0, 50) + '...');
                    return element;
                }
            } catch (error) {
                console.debug('Phương thức tìm kiếm lỗi:', error);
                continue;
            }
        }
        return null;
    },

    clickFrog() {
        try {
            const frog = this.findFrog();
            if (frog) {
                try {
                    frog.click();
                } catch (e) {
                    try {
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        frog.dispatchEvent(clickEvent);
                    } catch (e2) {
                        frog.focus();
                        const spaceEvent = new KeyboardEvent('keydown', {
                            key: ' ',
                            code: 'Space',
                            bubbles: true
                        });
                        frog.dispatchEvent(spaceEvent);
                    }
                }

                this.successCount++;
                console.log(`Click #${this.clickCount + 1} thành công! 🐸`);
                this.showStatus(); // Hiển thị trạng thái sau mỗi lần click
                return true;
            }
            this.failCount++;
            console.log('Không tìm thấy ếch ❌');
            return false;
        } catch (error) {
            this.failCount++;
            console.error('Lỗi click:', error);
            return false;
        }
    },

    getRandomDelay() {
        return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
    },

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    },

    showStatus() {
        const runTime = Date.now() - this.startTime;
        const elapsedTime = runTime / 1000;
        const clicksPerSecond = this.clickCount / elapsedTime;

        console.clear(); // Xóa console để hiển thị thông tin mới
        console.log(`=== TRẠNG THÁI HIỆN TẠI ===`);
        console.log(`Thời gian chạy: ${this.formatDuration(runTime)} ⏱️`);
        console.log(`Tổng số click: ${this.clickCount} 🎮`);
        console.log(`Thành công: ${this.successCount} ✅`);
        console.log(`Thất bại: ${this.failCount} ❌`);
        console.log(`Tỷ lệ thành công: ${(this.successCount/this.clickCount*100).toFixed(2)}% 📊`);
        console.log(`Tốc độ trung bình: ${clicksPerSecond.toFixed(2)} clicks/giây 🚀`);
        console.log(`Trạng thái: ${this.isRunning ? 'Đang chạy ▶️' : 'Đã dừng ⏹️'}`);
        console.log('=====================');
    },

    async start() {
        if (this.isRunning) {
            console.log('Auto clicker đang chạy rồi!');
            return;
        }

        this.isRunning = true;
        this.startTime = Date.now();
        console.log('Bắt đầu auto click vô hạn...');
        console.log(`Độ trễ giữa các lần click: ${this.minDelay}-${this.maxDelay}ms`);

        const performClick = async () => {
            if (!this.isRunning) return;

            this.clickFrog();
            this.clickCount++;

            const nextDelay = this.getRandomDelay();
            this.intervalId = setTimeout(performClick, nextDelay);
        };

        performClick();
    },

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        // Hiển thị thống kê cuối cùng
        this.showStatus();
        console.log('\nĐã dừng auto click! ⏹️');
        console.log('Để chạy lại, gõ: autoClicker.start()');
    },

    // Thêm phương thức reset để bắt đầu lại từ đầu
    reset() {
        this.stop();
        this.clickCount = 0;
        this.successCount = 0;
        this.failCount = 0;
        this.startTime = null;
        console.log('Đã reset toàn bộ thống kê!');
    },

    // Cấu hình tốc độ click
    setSpeed(speed) {
        switch(speed) {
            case 'fast':
                this.minDelay = 500;
                this.maxDelay = 1000;
                break;
            case 'normal':
                this.minDelay = 1000;
                this.maxDelay = 2000;
                break;
            case 'slow':
                this.minDelay = 2000;
                this.maxDelay = 3000;
                break;
            default:
                console.log('Tốc độ không hợp lệ. Sử dụng: "fast", "normal", hoặc "slow"');
                return;
        }
        console.log(`Đã đặt tốc độ ${speed}: ${this.minDelay}-${this.maxDelay}ms`);
    }

};

// Cách sử dụng:
autoClicker.setSpeed('fast'); // hoặc 'normal', 'slow'
autoClicker.start(); // Bắt đầu auto click

// Các lệnh khác:
// autoClicker.stop(); // Dừng auto click
// autoClicker.reset(); // Reset thống kê
// autoClicker.showStatus(); // Hiển thị trạng thái hiện tại
