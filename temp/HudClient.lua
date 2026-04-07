--[[
	HudClient.lua — Planet Miner HUD
	StarterPlayerScripts LocalScript
	Bouncy, dopamine-rich HUD for young players
	Production-ready — DisplayOrder 50, ResetOnSpawn false
]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Remote Events (direct children of ReplicatedStorage)
local PlayerDataLoaded = ReplicatedStorage:WaitForChild("PlayerDataLoaded", 10)
local CoinsGiven = ReplicatedStorage:WaitForChild("CoinsGiven", 10)
local LevelUp = ReplicatedStorage:WaitForChild("LevelUp", 10)
local ShopDataUpdate = ReplicatedStorage:WaitForChild("ShopDataUpdate", 10)

-- Config (optional — graceful fallback)
local SharedFolder = ReplicatedStorage:WaitForChild("Shared", 10)
local Config = SharedFolder and SharedFolder:FindFirstChild("Config")
if Config and Config:IsA("ModuleScript") then
	Config = require(Config)
else
	Config = nil
end

local PlaceConfig = SharedFolder and SharedFolder:FindFirstChild("PlaceConfig")
if PlaceConfig and PlaceConfig:IsA("ModuleScript") then
	PlaceConfig = require(PlaceConfig)
else
	PlaceConfig = nil
end

-- Pickaxe icons
local PICKAXE_ICONS = {
	Pickaxe_Base      = "rbxassetid://107551188536927",
	Pickaxe_Infernal  = "rbxassetid://127749604572581",
	Pickaxe_Void      = "rbxassetid://132558456434815",
	Pickaxe_Lightning = "rbxassetid://79938698797113",
}

-- Color palette
local C = {
	panelBg     = Color3.fromRGB(12, 14, 30),
	panelBgLight= Color3.fromRGB(22, 26, 50),
	accent      = Color3.fromRGB(120, 90, 230),
	gold        = Color3.fromRGB(255, 210, 50),
	green       = Color3.fromRGB(80, 210, 130),
	cyan        = Color3.fromRGB(60, 200, 255),
	textPrimary = Color3.fromRGB(240, 240, 255),
	textSecondary = Color3.fromRGB(160, 165, 190),
	white       = Color3.fromRGB(255, 255, 255),
	black       = Color3.fromRGB(0, 0, 0),
}

-- State
local currentCoins = 0
local displayedCoins = 0
local currentLevel = 1
local currentXp = 0
local xpForNextLevel = 100
local currentPlanet = "Unknown"
local currentSystem = "Sol"
local equippedPickaxe = "Pickaxe_Base"

-- ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "PlanetMinerHUD"
screenGui.ResetOnSpawn = false
screenGui.DisplayOrder = 50
screenGui.IgnoreGuiInset = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = playerGui

---------------------------------------------------------------------------
-- UTILITY
---------------------------------------------------------------------------

local function create(class, props, children)
	local inst = Instance.new(class)
	for k, v in pairs(props) do
		inst[k] = v
	end
	if children then
		for _, child in ipairs(children) do
			child.Parent = inst
		end
	end
	return inst
end

local function pill(props)
	local frame = create("Frame", props)
	create("UICorner", { CornerRadius = UDim.new(0.5, 0), Parent = frame })
	return frame
end

local function addGlow(parent, color, transparency)
	transparency = transparency or 0.7
	local glow = create("ImageLabel", {
		Name = "Glow",
		Size = UDim2.new(1.5, 0, 1.5, 0),
		Position = UDim2.new(0.5, 0, 0.5, 0),
		AnchorPoint = Vector2.new(0.5, 0.5),
		BackgroundTransparency = 1,
		Image = "rbxassetid://5028857084",
		ImageColor3 = color,
		ImageTransparency = transparency,
		ZIndex = -1,
		Parent = parent,
	})
	return glow
end

local function addStroke(parent, color, thickness)
	return create("UIStroke", {
		Color = color or C.accent,
		Thickness = thickness or 1.5,
		Transparency = 0.5,
		Parent = parent,
	})
end

local function formatNumber(n)
	n = math.floor(n)
	if n >= 1e9 then
		return string.format("%.1fB", n / 1e9)
	elseif n >= 1e6 then
		return string.format("%.1fM", n / 1e6)
	elseif n >= 1e3 then
		return string.format("%.1fK", n / 1e3)
	end
	return tostring(n)
end

local function tweenBounceIn(inst, targetProps, duration, delay)
	duration = duration or 0.5
	delay = delay or 0
	local info = TweenInfo.new(duration, Enum.EasingStyle.Back, Enum.EasingDirection.Out, 0, false, delay)
	local tween = TweenService:Create(inst, info, targetProps)
	tween:Play()
	return tween
end

local function tweenSmooth(inst, targetProps, duration, delay)
	duration = duration or 0.4
	delay = delay or 0
	local info = TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, delay)
	local tween = TweenService:Create(inst, info, targetProps)
	tween:Play()
	return tween
end

---------------------------------------------------------------------------
-- 1. COIN COUNTER (top-left)
---------------------------------------------------------------------------

local coinPanel = pill({
	Name = "CoinPanel",
	Size = UDim2.new(0, 200, 0, 46),
	Position = UDim2.new(0, 16, 0, 16),
	BackgroundColor3 = C.panelBg,
	BackgroundTransparency = 0.15,
	Parent = screenGui,
})
addStroke(coinPanel, C.gold, 1.5)
create("UIGradient", {
	Color = ColorSequence.new(C.panelBg, C.panelBgLight),
	Rotation = 90,
	Parent = coinPanel,
})

-- Coin icon circle
local coinIcon = create("Frame", {
	Name = "CoinIcon",
	Size = UDim2.new(0, 34, 0, 34),
	Position = UDim2.new(0, 6, 0.5, 0),
	AnchorPoint = Vector2.new(0, 0.5),
	BackgroundColor3 = C.gold,
	Parent = coinPanel,
})
create("UICorner", { CornerRadius = UDim.new(1, 0), Parent = coinIcon })
local coinGlow = addGlow(coinIcon, C.gold, 0.6)

local coinSymbol = create("TextLabel", {
	Name = "Symbol",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Text = "$",
	TextColor3 = C.panelBg,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = coinIcon,
})

local coinLabel = create("TextLabel", {
	Name = "CoinLabel",
	Size = UDim2.new(1, -48, 1, 0),
	Position = UDim2.new(0, 46, 0, 0),
	BackgroundTransparency = 1,
	Text = "0",
	TextColor3 = C.gold,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = coinPanel,
})

---------------------------------------------------------------------------
-- 2. LEVEL & XP BAR (top-left, below coins)
---------------------------------------------------------------------------

local levelPanel = pill({
	Name = "LevelPanel",
	Size = UDim2.new(0, 200, 0, 46),
	Position = UDim2.new(0, 16, 0, 70),
	BackgroundColor3 = C.panelBg,
	BackgroundTransparency = 0.15,
	Parent = screenGui,
})
addStroke(levelPanel, C.accent, 1.5)
create("UIGradient", {
	Color = ColorSequence.new(C.panelBg, C.panelBgLight),
	Rotation = 90,
	Parent = levelPanel,
})

-- Level badge
local levelBadge = create("Frame", {
	Name = "LevelBadge",
	Size = UDim2.new(0, 52, 0, 26),
	Position = UDim2.new(0, 6, 0, 4),
	AnchorPoint = Vector2.new(0, 0),
	BackgroundColor3 = C.accent,
	Parent = levelPanel,
})
create("UICorner", { CornerRadius = UDim.new(0.4, 0), Parent = levelBadge })

local levelText = create("TextLabel", {
	Name = "LevelText",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Text = "Lv. 1",
	TextColor3 = C.white,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = levelBadge,
})

-- XP fraction label
local xpText = create("TextLabel", {
	Name = "XpText",
	Size = UDim2.new(0, 130, 0, 20),
	Position = UDim2.new(0, 64, 0, 6),
	BackgroundTransparency = 1,
	Text = "0 / 100 XP",
	TextColor3 = C.textSecondary,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = levelPanel,
})

-- XP bar track
local xpTrack = pill({
	Name = "XpTrack",
	Size = UDim2.new(1, -14, 0, 10),
	Position = UDim2.new(0, 7, 1, -14),
	BackgroundColor3 = Color3.fromRGB(30, 32, 55),
	Parent = levelPanel,
})

-- XP bar fill
local xpFill = pill({
	Name = "XpFill",
	Size = UDim2.new(0, 0, 1, 0),
	BackgroundColor3 = C.accent,
	ClipsDescendants = true,
	Parent = xpTrack,
})
create("UIGradient", {
	Color = ColorSequence.new(C.accent, C.cyan),
	Parent = xpFill,
})
local xpFillGlow = addGlow(xpFill, C.accent, 0.65)

-- Shimmer overlay (animated shine moving across bar)
local shimmer = create("Frame", {
	Name = "Shimmer",
	Size = UDim2.new(0.25, 0, 1, 0),
	Position = UDim2.new(-0.3, 0, 0, 0),
	BackgroundTransparency = 0,
	BackgroundColor3 = C.white,
	Parent = xpFill,
})
create("UICorner", { CornerRadius = UDim.new(0.5, 0), Parent = shimmer })
create("UIGradient", {
	Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(0.5, 0.7),
		NumberSequenceKeypoint.new(1, 1),
	}),
	Parent = shimmer,
})

-- Shimmer loop
task.spawn(function()
	while screenGui.Parent do
		shimmer.Position = UDim2.new(-0.3, 0, 0, 0)
		local info = TweenInfo.new(1.8, Enum.EasingStyle.Linear)
		TweenService:Create(shimmer, info, { Position = UDim2.new(1.1, 0, 0, 0) }):Play()
		task.wait(2.8)
	end
end)

---------------------------------------------------------------------------
-- 3. PLANET INFO (top-right)
---------------------------------------------------------------------------

local planetPanel = pill({
	Name = "PlanetPanel",
	Size = UDim2.new(0, 210, 0, 46),
	Position = UDim2.new(1, -16, 0, 16),
	AnchorPoint = Vector2.new(1, 0),
	BackgroundColor3 = C.panelBg,
	BackgroundTransparency = 0.15,
	Parent = screenGui,
})
addStroke(planetPanel, C.cyan, 1.5)
create("UIGradient", {
	Color = ColorSequence.new(C.panelBgLight, C.panelBg),
	Rotation = 90,
	Parent = planetPanel,
})

-- Planet icon
local planetIcon = create("Frame", {
	Name = "PlanetIcon",
	Size = UDim2.new(0, 30, 0, 30),
	Position = UDim2.new(1, -8, 0.5, 0),
	AnchorPoint = Vector2.new(1, 0.5),
	BackgroundColor3 = C.cyan,
	Parent = planetPanel,
})
create("UICorner", { CornerRadius = UDim.new(1, 0), Parent = planetIcon })
local planetGlow = addGlow(planetIcon, C.cyan, 0.65)

local planetNameLabel = create("TextLabel", {
	Name = "PlanetName",
	Size = UDim2.new(1, -50, 0, 22),
	Position = UDim2.new(0, 10, 0, 3),
	BackgroundTransparency = 1,
	Text = "Unknown",
	TextColor3 = C.textPrimary,
	TextXAlignment = Enum.TextXAlignment.Right,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = planetPanel,
})

local systemLabel = create("TextLabel", {
	Name = "SystemName",
	Size = UDim2.new(1, -50, 0, 16),
	Position = UDim2.new(0, 10, 0, 25),
	BackgroundTransparency = 1,
	Text = "Sol System",
	TextColor3 = C.textSecondary,
	TextXAlignment = Enum.TextXAlignment.Right,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = planetPanel,
})

---------------------------------------------------------------------------
-- 4. PICKAXE DISPLAY (bottom-center)
---------------------------------------------------------------------------

local pickaxePanel = pill({
	Name = "PickaxePanel",
	Size = UDim2.new(0, 210, 0, 44),
	Position = UDim2.new(0.5, 0, 1, -16),
	AnchorPoint = Vector2.new(0.5, 1),
	BackgroundColor3 = C.panelBg,
	BackgroundTransparency = 0.15,
	Parent = screenGui,
})
addStroke(pickaxePanel, C.accent, 1.5)
create("UIGradient", {
	Color = ColorSequence.new(C.panelBg, C.panelBgLight),
	Rotation = 90,
	Parent = pickaxePanel,
})

-- Pickaxe icon
local pickaxeIcon = create("ImageLabel", {
	Name = "PickaxeIcon",
	Size = UDim2.new(0, 32, 0, 32),
	Position = UDim2.new(0, 6, 0.5, 0),
	AnchorPoint = Vector2.new(0, 0.5),
	BackgroundTransparency = 1,
	Image = PICKAXE_ICONS.Pickaxe_Base or "",
	ScaleType = Enum.ScaleType.Fit,
	Parent = pickaxePanel,
})

local pickaxeLabel = create("TextLabel", {
	Name = "PickaxeLabel",
	Size = UDim2.new(1, -86, 1, 0),
	Position = UDim2.new(0, 42, 0, 0),
	BackgroundTransparency = 1,
	Text = "Base",
	TextColor3 = C.textPrimary,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = pickaxePanel,
})

-- Key hint
local keyHint = pill({
	Name = "KeyHint",
	Size = UDim2.new(0, 36, 0, 24),
	Position = UDim2.new(1, -8, 0.5, 0),
	AnchorPoint = Vector2.new(1, 0.5),
	BackgroundColor3 = C.panelBgLight,
	Parent = pickaxePanel,
})
addStroke(keyHint, C.textSecondary, 1)

create("TextLabel", {
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Text = "[G]",
	TextColor3 = C.textSecondary,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = keyHint,
})

local pickaxePanelGlow = addGlow(pickaxePanel, C.accent, 0.75)

---------------------------------------------------------------------------
-- 5. ENTRANCE ANIMATIONS (staggered bounce-in)
---------------------------------------------------------------------------

local panels = { coinPanel, levelPanel, planetPanel, pickaxePanel }
local panelTargets = {}

for i, panel in ipairs(panels) do
	panelTargets[panel] = panel.Position
	-- Start off-screen / invisible
	if i <= 2 then
		panel.Position = panelTargets[panel] + UDim2.new(0, -80, 0, 0)
	elseif i == 3 then
		panel.Position = panelTargets[panel] + UDim2.new(0, 80, 0, 0)
	else
		panel.Position = panelTargets[panel] + UDim2.new(0, 0, 0, 60)
	end
	panel.BackgroundTransparency = 1

	-- Staggered entrance
	task.delay(0.15 * i, function()
		tweenSmooth(panel, { BackgroundTransparency = 0.15 }, 0.3)
		tweenBounceIn(panel, { Position = panelTargets[panel] }, 0.55)
	end)
end

---------------------------------------------------------------------------
-- 6. IDLE BREATHING ANIMATIONS
---------------------------------------------------------------------------

task.spawn(function()
	while screenGui.Parent do
		-- Coin glow pulse
		TweenService:Create(coinGlow, TweenInfo.new(1.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
			ImageTransparency = 0.45,
		}):Play()
		task.wait(1.6)
		TweenService:Create(coinGlow, TweenInfo.new(1.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
			ImageTransparency = 0.7,
		}):Play()
		task.wait(1.6)
	end
end)

task.spawn(function()
	while screenGui.Parent do
		-- Planet icon pulse (scale)
		TweenService:Create(planetIcon, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
			Size = UDim2.new(0, 33, 0, 33),
		}):Play()
		task.wait(2)
		TweenService:Create(planetIcon, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
			Size = UDim2.new(0, 30, 0, 30),
		}):Play()
		task.wait(2)
	end
end)

---------------------------------------------------------------------------
-- 7. UPDATE FUNCTIONS
---------------------------------------------------------------------------

local function getXpRequired(level)
	if Config and Config.XP_FOR_LEVEL then
		return Config.XP_FOR_LEVEL[level + 1] or (level * 100)
	end
	return level * 100
end

local function updateXpBar(animate)
	local ratio = 0
	if xpForNextLevel > 0 then
		ratio = math.clamp(currentXp / xpForNextLevel, 0, 1)
	end
	xpText.Text = formatNumber(currentXp) .. " / " .. formatNumber(xpForNextLevel) .. " XP"
	if animate then
		tweenSmooth(xpFill, { Size = UDim2.new(ratio, 0, 1, 0) }, 0.5)
	else
		xpFill.Size = UDim2.new(ratio, 0, 1, 0)
	end
end

local function updateLevel(level, animate)
	currentLevel = level
	levelText.Text = "Lv. " .. tostring(level)
	xpForNextLevel = getXpRequired(level)
	if animate then
		-- Level badge bounce
		TweenService:Create(levelBadge, TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
			Size = UDim2.new(0, 60, 0, 30),
		}):Play()
		task.delay(0.15, function()
			TweenService:Create(levelBadge, TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
				Size = UDim2.new(0, 52, 0, 26),
			}):Play()
		end)
	end
end

local function updatePickaxe(pickaxeId)
	if not pickaxeId then return end
	equippedPickaxe = pickaxeId
	-- Display name: strip "Pickaxe_" prefix
	local displayName = pickaxeId:gsub("Pickaxe_", "")
	pickaxeLabel.Text = displayName

	-- Icon
	local icon = PICKAXE_ICONS[pickaxeId]
	if icon then
		pickaxeIcon.Image = icon
		pickaxeIcon.BackgroundTransparency = 1
	else
		pickaxeIcon.Image = ""
		pickaxeIcon.BackgroundTransparency = 0
		pickaxeIcon.BackgroundColor3 = C.accent
	end
end

local function updatePlanetInfo()
	-- Try reading StringValues from ReplicatedStorage
	local planetVal = ReplicatedStorage:FindFirstChild("CurrentPlanet")
	local systemVal = ReplicatedStorage:FindFirstChild("CurrentSystem")
	if planetVal and planetVal:IsA("StringValue") then
		currentPlanet = planetVal.Value
		planetNameLabel.Text = currentPlanet
	end
	if systemVal and systemVal:IsA("StringValue") then
		currentSystem = systemVal.Value
		systemLabel.Text = currentSystem .. " System"
	end
end

-- Coin count-up animation
local countUpConnection = nil

local function animateCoinsTo(target)
	if countUpConnection then
		countUpConnection:Disconnect()
		countUpConnection = nil
	end

	local start = displayedCoins
	local diff = target - start
	if diff == 0 then return end

	local duration = math.clamp(math.abs(diff) / 500, 0.2, 1.2)
	local elapsed = 0

	countUpConnection = RunService.Heartbeat:Connect(function(dt)
		elapsed = elapsed + dt
		local alpha = math.clamp(elapsed / duration, 0, 1)
		-- Ease out
		alpha = 1 - (1 - alpha) ^ 3
		displayedCoins = math.floor(start + diff * alpha)
		coinLabel.Text = formatNumber(displayedCoins)
		if alpha >= 1 then
			displayedCoins = target
			coinLabel.Text = formatNumber(target)
			if countUpConnection then
				countUpConnection:Disconnect()
				countUpConnection = nil
			end
		end
	end)
end

local function coinBounce()
	-- Panel bounce
	TweenService:Create(coinPanel, TweenInfo.new(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size = UDim2.new(0, 210, 0, 50),
	}):Play()
	task.delay(0.1, function()
		TweenService:Create(coinPanel, TweenInfo.new(0.35, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
			Size = UDim2.new(0, 200, 0, 46),
		}):Play()
	end)

	-- Glow flash
	TweenService:Create(coinGlow, TweenInfo.new(0.1), { ImageTransparency = 0.2 }):Play()
	task.delay(0.15, function()
		TweenService:Create(coinGlow, TweenInfo.new(0.5), { ImageTransparency = 0.6 }):Play()
	end)
end

local function levelUpFlash()
	-- XP bar golden flash
	local origColor = C.accent
	TweenService:Create(xpFill, TweenInfo.new(0.15), { BackgroundColor3 = C.gold }):Play()
	task.delay(0.3, function()
		TweenService:Create(xpFill, TweenInfo.new(0.5), { BackgroundColor3 = origColor }):Play()
	end)

	-- Level badge golden flash
	TweenService:Create(levelBadge, TweenInfo.new(0.15), { BackgroundColor3 = C.gold }):Play()
	task.delay(0.5, function()
		TweenService:Create(levelBadge, TweenInfo.new(0.4), { BackgroundColor3 = C.accent }):Play()
	end)

	-- Big bounce on level panel
	TweenService:Create(levelPanel, TweenInfo.new(0.12, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size = UDim2.new(0, 216, 0, 52),
	}):Play()
	task.delay(0.12, function()
		TweenService:Create(levelPanel, TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out), {
			Size = UDim2.new(0, 200, 0, 46),
		}):Play()
	end)
end

---------------------------------------------------------------------------
-- 8. EVENT CONNECTIONS
---------------------------------------------------------------------------

if PlayerDataLoaded then
	PlayerDataLoaded.OnClientEvent:Connect(function(data)
		if not data then return end

		-- Coins
		if data.coins then
			currentCoins = data.coins
			animateCoinsTo(currentCoins)
		end

		-- Level & XP
		if data.level then
			updateLevel(data.level, false)
		end
		if data.xp then
			currentXp = data.xp
		end
		updateXpBar(true)

		-- Pickaxe
		if data.equippedPickaxe then
			updatePickaxe(data.equippedPickaxe)
		end

		-- Planet info
		updatePlanetInfo()
	end)
end

if CoinsGiven then
	CoinsGiven.OnClientEvent:Connect(function(amount)
		if not amount or type(amount) ~= "number" then return end
		currentCoins = currentCoins + amount
		animateCoinsTo(currentCoins)
		coinBounce()
	end)
end

if LevelUp then
	LevelUp.OnClientEvent:Connect(function(newLevel)
		if not newLevel then return end
		updateLevel(newLevel, true)
		currentXp = 0
		updateXpBar(true)
		levelUpFlash()
	end)
end

if ShopDataUpdate then
	ShopDataUpdate.OnClientEvent:Connect(function(materials, newCoins)
		if newCoins and type(newCoins) == "number" then
			currentCoins = newCoins
			animateCoinsTo(currentCoins)
			coinBounce()
		end
	end)
end

-- Planet StringValue change listeners
task.spawn(function()
	local planetVal = ReplicatedStorage:WaitForChild("CurrentPlanet", 15)
	if planetVal and planetVal:IsA("StringValue") then
		planetVal.Changed:Connect(function()
			updatePlanetInfo()
		end)
	end

	local systemVal = ReplicatedStorage:WaitForChild("CurrentSystem", 15)
	if systemVal and systemVal:IsA("StringValue") then
		systemVal.Changed:Connect(function()
			updatePlanetInfo()
		end)
	end

	-- Initial update
	updatePlanetInfo()
end)

---------------------------------------------------------------------------
-- DONE
---------------------------------------------------------------------------
