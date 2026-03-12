/**
 * 🎁 盲盒勇者 v1.0.0
 * 核心框架 - 美术增强版
 */

// ==================== 数据配置 ====================
const RARITY = {
    COMMON: { name: '凡品', color: '#999', chance: 40, emoji: '⚪' },
    UNCOMMON: { name: '优品', color: '#4f4', chance: 30, emoji: '🟢' },
    RARE: { name: '精品', color: '#44f', chance: 20, emoji: '🔵' },
    EPIC: { name: '稀有', color: '#a4f', chance: 7, emoji: '🟣' },
    LEGENDARY: { name: '传说', color: '#fa0', chance: 2.5, emoji: '🟡' },
    HIDDEN: { name: '隐藏', color: '#f00', chance: 0.5, emoji: '🔴' }
};

const ITEMS = {
    weapons: [
        { name: '木剑', attack: 5, emoji: '🗡️', rarities: ['COMMON', 'UNCOMMON'] },
        { name: '铁剑', attack: 10, emoji: '⚔️', rarities: ['UNCOMMON', 'RARE'] },
        { name: '钢剑', attack: 18, emoji: '🔪', rarities: ['RARE', 'EPIC'] },
        { name: '银剑', attack: 30, emoji: '✨', rarities: ['EPIC', 'LEGENDARY'] },
        { name: '龙剑', attack: 50, emoji: '🐉', rarities: ['LEGENDARY', 'HIDDEN'] },
        { name: '神剑', attack: 100, emoji: '👑', rarities: ['HIDDEN'] }
    ],
    armors: [
        { name: '布衣', defense: 3, emoji: '👕', rarities: ['COMMON', 'UNCOMMON'] },
        { name: '皮甲', defense: 8, emoji: '🦺', rarities: ['UNCOMMON', 'RARE'] },
        { name: '铁甲', defense: 15, emoji: '🛡️', rarities: ['RARE', 'EPIC'] },
        { name: '钢甲', defense: 25, emoji: '✨', rarities: ['EPIC', 'LEGENDARY'] },
        { name: '龙甲', defense: 40, emoji: '🐉', rarities: ['LEGENDARY', 'HIDDEN'] }
    ],
    potions: [
        { name: '小血瓶', heal: 30, emoji: '🧪', rarities: ['COMMON'] },
        { name: '中血瓶', heal: 60, emoji: '🍷', rarities: ['UNCOMMON'] },
        { name: '大血瓶', heal: 100, emoji: '💊', rarities: ['RARE'] }
    ]
};

const ENEMIES = [
    { name: '史莱姆', hp: 20, attack: 5, exp: 10, gold: 5, emoji: '💧', floor: 1 },
    { name: '哥布林', hp: 30, attack: 8, exp: 15, gold: 10, emoji: '👺', floor: 3 },
    { name: '骷髅兵', hp: 45, attack: 12, exp: 25, gold: 18, emoji: '💀', floor: 5 },
    { name: '兽人', hp: 60, attack: 18, exp: 35, gold: 30, emoji: '👹', floor: 8 },
    { name: '黑暗骑士', hp: 100, attack: 25, exp: 60, gold: 50, emoji: '🖤', floor: 10 },
    { name: '魔龙', hp: 200, attack: 40, exp: 150, gold: 150, emoji: '🐉', floor: 15, boss: true }
];

// ==================== 游戏类 ====================
class Game {
    constructor() {
        this.player = {
            hp: 100,
            maxHp: 100,
            attack: 10,
            defense: 0,
            gold: 0,
            exp: 0,
            level: 1,
            luck: 5,
            equipment: { weapon: null, armor: null },
            bag: []
        };
        
        this.floor = 1;
        this.blindboxes = [];
        this.inBattle = false;
        this.currentEnemy = null;
        this.log = [];
    }
    
    start() {
        document.getElementById('startScreen').style.display = 'none';
        this.addLog('=== 冒险开始 ===', 'event');
        this.addLog('探索地牢，收集盲盒，击败魔龙！');
        
        // 初始赠送一个盲盒
        this.addBlindbox();
        
        this.updateUI();
    }
    
    // 添加盲盒
    addBlindbox() {
        const rarity = this.rollRarity();
        const type = this.rollItemType(rarity);
        const item = this.rollItem(type, rarity);
        
        this.blindboxes.push({ rarity, type, item });
        this.updateBlindboxDisplay();
    }
    
    // roll 品质
    rollRarity() {
        const rand = Math.random() * 100;
        const luckBonus = this.player.luck * 0.5;
        
        let cumulative = 0;
        for (const [key, value] of Object.entries(RARITY)) {
            cumulative += value.chance + (key === 'HIDDEN' ? luckBonus : 0);
            if (rand <= cumulative) return key;
        }
        return 'COMMON';
    }
    
    // roll 类型
    rollItemType(rarity) {
        const rand = Math.random();
        if (rand < 0.5) return 'weapons';
        if (rand < 0.8) return 'armors';
        return 'potions';
    }
    
    // roll 具体物品
    rollItem(type, rarity) {
        const pool = ITEMS[type].filter(item => 
            item.rarities.includes(rarity)
        );
        
        if (pool.length === 0) {
            return ITEMS[type][0];
        }
        
        return pool[Math.floor(Math.random() * pool.length)];
    }
    
    // 更新盲盒显示
    updateBlindboxDisplay() {
        const box = document.getElementById('mainBlindbox');
        if (this.blindboxes.length > 0) {
            const rarity = this.blindboxes[0].rarity.toLowerCase();
            box.className = `blindbox ${rarity}`;
            box.textContent = '🎁';
        } else {
            box.className = 'blindbox';
            box.textContent = '❓';
        }
    }
    
    // 开启盲盒
    openBlindbox() {
        if (this.blindboxes.length === 0) {
            this.addLog('没有盲盒了，先去探索吧！');
            return;
        }
        
        if (this.inBattle) {
            this.addLog('战斗中无法开启盲盒！');
            return;
        }
        
        const blindbox = this.blindboxes.shift();
        this.updateBlindboxDisplay();
        
        // 动画效果
        const box = document.getElementById('mainBlindbox');
        box.style.animation = 'open 0.5s forwards';
        
        setTimeout(() => {
            box.style.animation = '';
            this.showGetItem(blindbox);
        }, 500);
    }
    
    // 显示获得物品
    showGetItem(blindbox) {
        const { rarity, item } = blindbox;
        const rarityInfo = RARITY[rarity];
        
        document.getElementById('getItemSprite').textContent = item.emoji;
        document.getElementById('getItemName').textContent = item.name;
        document.getElementById('getItemRarity').textContent = rarityInfo.name;
        document.getElementById('getItemRarity').className = `item-rarity rarity-${rarity.toLowerCase()}`;
        
        // 应用物品
        if (blindbox.type === 'weapons') {
            const oldAtk = this.player.equipment.weapon?.attack || 0;
            this.player.equipment.weapon = item;
            this.player.attack = 10 + item.attack;
            this.addLog(`获得武器：${item.name} (攻击 +${item.attack})`, `log-${rarity.toLowerCase()}`);
        } else if (blindbox.type === 'armors') {
            this.player.equipment.armor = item;
            this.player.defense = item.defense;
            this.addLog(`获得护甲：${item.name} (防御 +${item.defense})`, `log-${rarity.toLowerCase()}`);
        } else if (blindbox.type === 'potions') {
            this.player.bag.push(item);
            this.addLog(`获得消耗品：${item.name}`, `log-${rarity.toLowerCase()}`);
        }
        
        // 稀有度提示
        if (rarity === 'EPIC' || rarity === 'LEGENDARY' || rarity === 'HIDDEN') {
            this.addLog(`🎉 ${rarityInfo.name}物品！运气爆棚！`, `log-${rarity.toLowerCase()}`);
        }
        
        document.getElementById('getItem').style.display = 'block';
        this.updateUI();
    }
    
    // 探索
    explore() {
        if (this.inBattle) {
            this.addLog('正在战斗中！');
            return;
        }
        
        const rand = Math.random();
        
        if (rand < 0.5) {
            // 遭遇敌人
            this.encounterEnemy();
        } else if (rand < 0.7) {
            // 获得盲盒
            this.addBlindbox();
            this.addLog('🎁 发现一个盲盒！', 'log-loot');
        } else if (rand < 0.85) {
            // 获得金币
            const gold = Math.floor(Math.random() * 20) + 10;
            this.player.gold += gold;
            this.addLog(`💰 获得 ${gold} 金币`, 'log-loot');
        } else {
            // 恢复生命
            const heal = Math.floor(Math.random() * 15) + 10;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
            this.addLog(`💚 恢复了 ${heal} 点生命`, 'log-loot');
        }
        
        this.updateUI();
    }
    
    // 遭遇敌人
    encounterEnemy() {
        const available = ENEMIES.filter(e => e.floor <= this.floor);
        const enemyTemplate = available[Math.floor(Math.random() * available.length)];
        
        this.currentEnemy = { ...enemyTemplate, maxHp: enemyTemplate.hp };
        this.inBattle = true;
        
        this.addLog(`⚔️ 遭遇 ${this.currentEnemy.name}！`, 'log-combat');
        
        // 显示战斗场景
        document.getElementById('blindboxDisplay').style.display = 'none';
        document.getElementById('battleScene').style.display = 'flex';
        document.getElementById('enemySprite').textContent = this.currentEnemy.emoji;
        document.getElementById('enemyName').textContent = this.currentEnemy.name;
        this.updateEnemyUI();
        
        // 自动战斗
        setTimeout(() => this.battleRound(), 800);
    }
    
    // 战斗回合
    battleRound() {
        if (!this.inBattle) return;
        
        const enemy = this.currentEnemy;
        
        // 玩家攻击
        let damage = Math.max(1, this.player.attack);
        
        // 暴击
        if (Math.random() < 0.1 + (this.player.luck * 0.01)) {
            damage *= 2;
            this.addLog('💥 暴击！', 'log-combat');
        }
        
        enemy.hp -= damage;
        this.showDamage(damage);
        this.addLog(`你攻击 ${enemy.name}，造成 ${damage} 伤害`, 'log-combat');
        this.updateEnemyUI();
        
        if (enemy.hp <= 0) {
            setTimeout(() => this.winBattle(), 500);
            return;
        }
        
        // 敌人攻击
        setTimeout(() => {
            if (!this.inBattle) return;
            
            let enemyDamage = Math.max(1, enemy.attack - Math.floor(this.player.defense / 2));
            this.player.hp -= enemyDamage;
            this.addLog(`${enemy.name} 攻击你，造成 ${enemyDamage} 伤害`, 'log-combat');
            
            if (this.player.hp <= 0) {
                this.gameOver();
            }
            
            this.updateUI();
            
            if (this.inBattle) {
                setTimeout(() => this.battleRound(), 1000);
            }
        }, 800);
    }
    
    // 显示伤害数字
    showDamage(amount) {
        const battleScene = document.getElementById('battleScene');
        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number';
        damageEl.textContent = `-${amount}`;
        damageEl.style.left = '50%';
        damageEl.style.top = '30%';
        battleScene.appendChild(damageEl);
        
        setTimeout(() => damageEl.remove(), 1000);
    }
    
    // 战斗胜利
    winBattle() {
        const enemy = this.currentEnemy;
        this.inBattle = false;
        this.currentEnemy = null;
        
        this.player.gold += enemy.gold;
        this.player.exp += enemy.exp;
        
        this.addLog(`✨ 击败了 ${enemy.name}！`, 'log-loot');
        this.addLog(`获得 ${enemy.gold} 金币，${enemy.exp} 经验`, 'log-loot');
        
        // 几率掉落盲盒
        if (Math.random() < 0.5) {
            this.addBlindbox();
            this.addLog('🎁 敌人掉落了一个盲盒！', 'log-loot');
        }
        
        // 升级
        this.checkLevelUp();
        
        // 恢复 UI
        document.getElementById('battleScene').style.display = 'none';
        document.getElementById('blindboxDisplay').style.display = 'flex';
        
        this.updateUI();
    }
    
    // 检查升级
    checkLevelUp() {
        const expNeeded = this.player.level * 50;
        
        if (this.player.exp >= expNeeded) {
            this.player.level++;
            this.player.exp -= expNeeded;
            this.player.maxHp += 20;
            this.player.hp = this.player.maxHp;
            this.player.attack += 3;
            this.player.luck += 1;
            
            this.addLog(`🎉 升级！当前等级：${this.player.level}`, 'log-epic');
            this.addLog('生命 +20，攻击 +3，幸运 +1', 'log-epic');
        }
    }
    
    // 显示背包
    showBag() {
        if (this.player.bag.length === 0) {
            this.addLog('背包是空的');
            return;
        }
        
        this.addLog('=== 背包 ===', 'log-event');
        this.player.bag.forEach((item, i) => {
            this.addLog(`${i+1}. ${item.emoji} ${item.name}`, 'log-loot');
        });
        
        // 自动使用第一个血瓶
        const potionIndex = this.player.bag.findIndex(item => item.heal);
        if (potionIndex >= 0 && this.player.hp < this.player.maxHp) {
            const potion = this.player.bag.splice(potionIndex, 1)[0];
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + potion.heal);
            this.addLog(`使用了 ${potion.name}，恢复 ${potion.heal} 生命`, 'log-heal');
            this.updateUI();
        }
    }
    
    // 游戏结束
    gameOver() {
        this.inBattle = false;
        this.addLog('💀 你死了...', 'log-hidden');
        this.addLog(`到达层数：${this.floor}，等级：${this.player.level}`, 'log-hidden');
        
        setTimeout(() => {
            alert(`游戏结束！\n到达层数：${this.floor}\n等级：${this.player.level}\n金币：${this.player.gold}`);
            location.reload();
        }, 1000);
    }
    
    // 更新 UI
    updateUI() {
        document.getElementById('hp').textContent = `${this.player.hp}/${this.player.maxHp}`;
        document.getElementById('atk').textContent = this.player.attack;
        document.getElementById('gold').textContent = this.player.gold;
        document.getElementById('floor').textContent = this.floor;
        document.getElementById('level').textContent = this.player.level;
        
        const expNeeded = this.player.level * 50;
        document.getElementById('exp').textContent = `${this.player.exp}/${expNeeded}`;
        document.getElementById('luck').textContent = this.player.luck;
    }
    
    updateEnemyUI() {
        if (!this.currentEnemy) return;
        
        const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        document.getElementById('enemyHpBar').style.width = `${Math.max(0, hpPercent)}%`;
        document.getElementById('enemyHpText').textContent = `${Math.max(0, this.currentEnemy.hp)}/${this.currentEnemy.maxHp}`;
    }
    
    // 日志
    addLog(text, type = '') {
        this.log.unshift({ text, type });
        if (this.log.length > 30) this.log.pop();
        
        const logEl = document.getElementById('log');
        logEl.innerHTML = this.log.map(entry => 
            `<div class="log-entry ${entry.type}">${entry.text}</div>`
        ).join('');
    }
}

// ==================== 游戏初始化 ====================
const game = new Game();
console.log('🎁 盲盒勇者 v1.0.0 已加载');
