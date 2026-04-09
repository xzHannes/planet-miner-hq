--[[
	HudClient.lua — Planet Miner HUD (Cosmic Glass Redesign)
	StarterPlayerScripts LocalScript
	Uses CosmicUI design system for consistent Cosmic Glass aesthetic.
	Corners-Only layout: all panels hug edges, center stays clear for gameplay.
]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local CosmicUI = require(script.Parent:WaitForChild("CosmicUI"))

-- Remote Events
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

-- Pickaxe icons
local PICKAXE_ICONS = {
	Pickaxe_Base      = "rbxassetid://107551188536927",
	Pickaxe_Infernal  = "rbxassetid://127749604572581",
	Pickaxe_Void      = "rbxassetid://132558456434815",
	Pickaxe_Lightning = "rbxassetid://79938698797113",
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
-- HELPER: Responsive sizes via CosmicUI.scale()
---------------------------------------------------------------------------

local function S(units)
	return CosmicUI.scale(units)
end

---------------------------------------------------------------------------
-- 1. COIN PANEL (Top-Left)
---------------------------------------------------------------------------

local coinPanel = CosmicUI.panel({
	name = "CoinPanel",
	size = UDim2.new(0, S(26), 0, S(6)),
	position = UDim2.new(0, S(2), 0, S(2)),
	strokeColor = CosmicUI.Colors.SolarGold,
	parent = screenGui,
})

-- Gold coin icon circle
local coinIcon = CosmicUI.create("Frame", {
	Name = "CoinIcon",
	Size = UDim2.new(0, S(4), 0, S(4)),
	Position = UDim2.new(0, S(1), 0.5, 0),
	AnchorPoint = Vector2.new(0, 0.5),
	BackgroundColor3 = CosmicUI.Colors.SolarGold,
	Parent = coinPanel,
})
CosmicUI.create("UICorner", { CornerRadius = UDim.new(1, 0), Parent = coinIcon })
CosmicUI.addGlow(coinIcon, CosmicUI.Colors.SolarGold, 0.6)

CosmicUI.create("TextLabel", {
	Name = "Symbol",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Text = "$",
	TextColor3 = CosmicUI.Colors.DeepSpace,
	TextScaled = true,
	Font = Enum.Font.FredokaOne,
	Parent = coinIcon,
})

local coinLabel = CosmicUI.create("TextLabel", {
	Name = "CoinLabel",
	Size = UDim2.new(1, -S(7), 1, 0),
	Position = UDim2.new(0, S(6), 0, 0),
	BackgroundTransparency = 1,
	Text = "0",
	TextColor3 = CosmicUI.Colors.SolarGold,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextSize = CosmicUI.fontSize("Body"),
	Font = Enum.Font.FredokaOne,
	Parent = coinPanel,
})

---------------------------------------------------------------------------
-- 2. LEVEL & XP PANEL (Top-Left, below coins)
---------------------------------------------------------------------------

local levelPanel = CosmicUI.panel({
	name = "LevelPanel",
	size = UDim2.new(0, S(26), 0, S(6)),
	position = UDim2.new(0, S(2), 0, S(9)),
	strokeColor = CosmicUI.Colors.Stardust,
	parent = screenGui,
})

-- Level badge pill
local levelBadge = CosmicUI.pill({
	name = "LevelBadge",
	size = UDim2.new(0, S(7), 0, S(3.2)),
	position = UDim2.new(0, S(0.8), 0, S(0.5)),
	color = CosmicUI.Colors.Stardust,
	transparency = 0,
	strokeColor = CosmicUI.Colors.Stardust,
	parent = levelPanel,
})

local levelText = CosmicUI.create("TextLabel", {
	Name = "LevelText",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Text = "Lv. 1",
	TextColor3 = CosmicUI.Colors.PulsarWhite,
	TextSize = CosmicUI.fontSize("Micro"),
	Font = Enum.Font.FredokaOne,
	Parent = levelBadge,
})

-- XP text
local xpText = CosmicUI.create("TextLabel", {
	Name = "XpText",
	Size = UDim2.new(1, -S(9), 0, S(2.5)),
	Position = UDim2.new(0, S(9), 0, S(0.6)),
	BackgroundTransparency = 1,
	Text = "0 / 100 XP",
	TextColor3 = CosmicUI.Colors.DustGrey,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextSize = CosmicUI.fontSize("Caption"),
	Font = Enum.Font.FredokaOne,
	Parent = levelPanel,
})

-- XP bar track
local xpTrack = CosmicUI.create("Frame", {
	Name = "XpTrack",
	Size = UDim2.new(1, -S(1.8), 0, S(1.2)),
	Position = UDim2.new(0, S(0.9), 1, -S(1.6)),
	BackgroundColor3 = Color3.fromRGB(30, 32, 55),
	BorderSizePixel = 0,
	Parent = levelPanel,
})
CosmicUI.create("UICorner", { CornerRadius = UDim.new(0.5, 0), Parent = xpTrack })

-- XP bar fill
local xpFill = CosmicUI.create("Frame", {
	Name = "XpFill",
	Size = UDim2.new(0, 0, 1, 0),
	BackgroundColor3 = CosmicUI.Colors.CosmicBlue,
	BorderSizePixel = 0,
	ClipsDescendants = true,
	Parent = xpTrack,
})
CosmicUI.create("UICorner", { CornerRadius = UDim.new(0.5, 0), Parent = xpFill })
CosmicUI.create("UIGradient", {
	Color = ColorSequence.new(CosmicUI.Colors.CosmicBlue, CosmicUI.Colors.NebulaCyan),
	Parent = xpFill,
})

-- Shimmer overlay on XP bar
local shimmer = CosmicUI.create("Frame", {
	Name = "Shimmer",
	Size = UDim2.new(0.25, 0, 1, 0),
	Position = UDim2.new(-0.3, 0, 0, 0),
	BackgroundTransparency = 0,
	BackgroundColor3 = CosmicUI.Colors.PulsarWhite,
	Parent = xpFill,
})
CosmicUI.create("UICorner", { CornerRadius = UDim.new(0.5, 0), Parent = shimmer })
CosmicUI.create("UIGradient", {
	Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(0.5, 0.7),
		NumberSequenceKeypoint.new(1, 1),
	}),
	Parent = shimmer,
})

-- Shimmer loop (TweenService OK for linear loops per spec)
task.spawn(function()
	while screenGui.Parent do
		shimmer.Position = UDim2.new(-0.3, 0, 0, 0)
		local info = TweenInfo.new(1.8, Enum.EasingStyle.Linear)
		TweenService:Create(shimmer, info, { Position = UDim2.new(1.1, 0, 0, 0) }):Play()
		task.wait(3)
	end
end)

---------------------------------------------------------------------------
-- 3. QUICK ACTIONS (Top-Right) — 3 icon buttons horizontal
---------------------------------------------------------------------------

local quickActionsFrame = CosmicUI.create("Frame", {
	Name = "QuickActions",
	Size = UDim2.new(0, S(18), 0, S(5.5)),
	Position = UDim2.new(1, -S(2), 0, S(2)),
	AnchorPoint = Vector2.new(1, 0),
	BackgroundTransparency = 1,
	Parent = screenGui,
})

CosmicUI.create("UIListLayout", {
	FillDirection = Enum.FillDirection.Horizontal,
	HorizontalAlignment = Enum.HorizontalAlignment.Right,
	Padding = UDim.new(0, S(1)),
	SortOrder = Enum.SortOrder.LayoutOrder,
	Parent = quickActionsFrame,
})

local quickActionDefs = {
	{ name = "Settings", label = "S", order = 1 },  -- gear
	{ name = "Sound",    label = "V", order = 2 },  -- volume
	{ name = "Menu",     label = "M", order = 3 },  -- menu
}

local quickActionButtons = {}
for _, def in ipairs(quickActionDefs) do
	local btn = CosmicUI.iconButton({
		name = def.name .. "Btn",
		size = UDim2.new(0, S(5.5), 0, S(5.5)),
		color = CosmicUI.Colors.CosmicBlue,
		parent = quickActionsFrame,
	})
	btn.LayoutOrder = def.order

	-- Text icon placeholder
	CosmicUI.create("TextLabel", {
		Name = "IconLabel",
		Size = UDim2.new(0.6, 0, 0.6, 0),
		Position = UDim2.new(0.5, 0, 0.5, 0),
		AnchorPoint = Vector2.new(0.5, 0.5),
		BackgroundTransparency = 1,
		Text = def.label,
		TextColor3 = CosmicUI.Colors.CosmicBlue,
		TextScaled = true,
		Font = Enum.Font.FredokaOne,
		Parent = btn,
	})

	quickActionButtons[def.name] = btn
end

---------------------------------------------------------------------------
-- 4. ACTION DOCK (Right Edge, vertical)
---------------------------------------------------------------------------

local dockFrame = CosmicUI.create("Frame", {
	Name = "ActionDock",
	Size = UDim2.new(0, S(6), 0, S(27)),
	Position = UDim2.new(1, -S(2), 0.5, 0),
	AnchorPoint = Vector2.new(1, 0.5),
	BackgroundTransparency = 1,
	Parent = screenGui,
})

CosmicUI.create("UIListLayout", {
	FillDirection = Enum.FillDirection.Vertical,
	VerticalAlignment = Enum.VerticalAlignment.Center,
	Padding = UDim.new(0, S(1)),
	SortOrder = Enum.SortOrder.LayoutOrder,
	Parent = dockFrame,
})

local dockDefs = {
	{ name = "Planet",      label = "P", order = 1 },
	{ name = "Inventory",   label = "I", order = 2 },
	{ name = "Shop",        label = "$", order = 3 },
	{ name = "Leaderboard", label = "L", order = 4 },
}

local dockButtons = {}
for _, def in ipairs(dockDefs) do
	local btn = CosmicUI.iconButton({
		name = def.name .. "Btn",
		size = UDim2.new(0, S(6), 0, S(6)),
		color = CosmicUI.Colors.CosmicBlue,
		parent = dockFrame,
	})
	btn.LayoutOrder = def.order

	CosmicUI.create("TextLabel", {
		Name = "IconLabel",
		Size = UDim2.new(0.6, 0, 0.6, 0),
		Position = UDim2.new(0.5, 0, 0.5, 0),
		AnchorPoint = Vector2.new(0.5, 0.5),
		BackgroundTransparency = 1,
		Text = def.label,
		TextColor3 = CosmicUI.Colors.CosmicBlue,
		TextScaled = true,
		Font = Enum.Font.FredokaOne,
		Parent = btn,
	})

	dockButtons[def.name] = btn
end

---------------------------------------------------------------------------
-- 5. PICKAXE PANEL (Bottom-Center)
---------------------------------------------------------------------------

local pickaxePanel = CosmicUI.panel({
	name = "PickaxePanel",
	size = UDim2.new(0, S(26), 0, S(5.5)),
	position = UDim2.new(0.5, 0, 1, -S(2)),
	anchorPoint = Vector2.new(0.5, 1),
	strokeColor = CosmicUI.Colors.Stardust,
	glow = true,
	glowColor = CosmicUI.Colors.Stardust,
	parent = screenGui,
})

local pickaxeIcon = CosmicUI.create("ImageLabel", {
	Name = "PickaxeIcon",
	Size = UDim2.new(0, S(4), 0, S(4)),
	Position = UDim2.new(0, S(1), 0.5, 0),
	AnchorPoint = Vector2.new(0, 0.5),
	BackgroundTransparency = 1,
	Image = PICKAXE_ICONS.Pickaxe_Base or "",
	ScaleType = Enum.ScaleType.Fit,
	Parent = pickaxePanel,
})
CosmicUI.addGlow(pickaxeIcon, CosmicUI.Colors.Stardust, 0.75)

local pickaxeLabel = CosmicUI.create("TextLabel", {
	Name = "PickaxeLabel",
	Size = UDim2.new(1, -S(12), 1, 0),
	Position = UDim2.new(0, S(6), 0, 0),
	BackgroundTransparency = 1,
	Text = "Base",
	TextColor3 = CosmicUI.Colors.PulsarWhite,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextSize = CosmicUI.fontSize("Body"),
	Font = Enum.Font.FredokaOne,
	Parent = pickaxePanel,
})

-- [G] hotkey badge
local keyBadge = CosmicUI.pill({
	name = "KeyBadge",
	size = UDim2.new(0, S(4.5), 0, S(3)),
	position = UDim2.new(1, -S(1), 0.5, 0),
	anchorPoint = Vector2.new(1, 0.5),
	color = CosmicUI.Colors.NebulaLight,
	strokeColor = CosmicUI.Colors.DustGrey,
	parent = pickaxePanel,
})

CosmicUI.create("TextLabel", {
	Name = "KeyText",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Text = "[G]",
	TextColor3 = CosmicUI.Colors.DustGrey,
	TextSize = CosmicUI.fontSize("Micro"),
	Font = Enum.Font.FredokaOne,
	Parent = keyBadge,
})

---------------------------------------------------------------------------
-- 6. ENTRANCE ANIMATIONS (staggered bounceIn)
---------------------------------------------------------------------------

-- Collect all panels with their entrance offsets
local entrancePanels = {
	{ inst = coinPanel,        offset = UDim2.new(0, -S(10), 0, 0),  delay = 0.0 },
	{ inst = levelPanel,       offset = UDim2.new(0, -S(10), 0, 0),  delay = 0.1 },
	{ inst = quickActionsFrame,offset = UDim2.new(0, S(10), 0, 0),   delay = 0.2 },
	{ inst = dockFrame,        offset = UDim2.new(0, S(10), 0, 0),   delay = 0.3 },
	{ inst = pickaxePanel,     offset = UDim2.new(0, 0, 0, S(8)),    delay = 0.4 },
}

for _, entry in ipairs(entrancePanels) do
	CosmicUI.bounceIn(entry.inst, entry.offset, entry.delay)
end

---------------------------------------------------------------------------
-- 7. IDLE BREATHING ANIMATIONS
---------------------------------------------------------------------------

-- Coin icon rotation wobble (+-2 degrees, 3s Sine)
task.spawn(function()
	local t = 0
	while screenGui.Parent do
		local dt = RunService.Heartbeat:Wait()
		t = t + dt
		coinIcon.Rotation = math.sin(t * (2 * math.pi / 3)) * 2
	end
end)

-- Dock icons subtle float Y +-2px (Sine, 4s, staggered 0.5s per icon)
for i, def in ipairs(dockDefs) do
	local btn = dockButtons[def.name]
	local basePos = btn.Position
	task.spawn(function()
		local t = (i - 1) * 0.5
		while screenGui.Parent do
			local dt = RunService.Heartbeat:Wait()
			t = t + dt
			local offsetY = math.sin(t * (2 * math.pi / 4)) * S(0.3)
			btn.Position = UDim2.new(basePos.X.Scale, basePos.X.Offset, basePos.Y.Scale, basePos.Y.Offset + offsetY)
		end
	end)
end

-- Pickaxe icon glow pulse
task.spawn(function()
	local pickaxeGlow = pickaxeIcon:FindFirstChild("Glow")
	if not pickaxeGlow then return end
	local t = 0
	while screenGui.Parent do
		local dt = RunService.Heartbeat:Wait()
		t = t + dt
		pickaxeGlow.ImageTransparency = 0.65 + math.sin(t * (2 * math.pi / 2.5)) * 0.15
	end
end)

---------------------------------------------------------------------------
-- 8. UPDATE FUNCTIONS
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
	xpText.Text = CosmicUI.formatNumber(currentXp) .. " / " .. CosmicUI.formatNumber(xpForNextLevel) .. " XP"
	if animate then
		CosmicUI.spring(xpFill, { Size = UDim2.new(ratio, 0, 1, 0) }, "Gentle")
	else
		xpFill.Size = UDim2.new(ratio, 0, 1, 0)
	end
end

local function updateLevel(level, animate)
	currentLevel = level
	levelText.Text = "Lv. " .. tostring(level)
	xpForNextLevel = getXpRequired(level)
	if animate then
		-- Level badge scale bounce with Elastic spring
		local targetSize = levelBadge.Size
		levelBadge.Size = UDim2.new(
			targetSize.X.Scale * 1.5, math.round(targetSize.X.Offset * 1.5),
			targetSize.Y.Scale * 1.5, math.round(targetSize.Y.Offset * 1.5)
		)
		CosmicUI.spring(levelBadge, { Size = targetSize }, "Elastic")
	end
end

local function updatePickaxe(pickaxeId)
	if not pickaxeId then return end
	equippedPickaxe = pickaxeId
	local displayName = pickaxeId:gsub("Pickaxe_", "")
	pickaxeLabel.Text = displayName

	local icon = PICKAXE_ICONS[pickaxeId]
	if icon then
		pickaxeIcon.Image = icon
		pickaxeIcon.BackgroundTransparency = 1
	else
		pickaxeIcon.Image = ""
		pickaxeIcon.BackgroundTransparency = 0
		pickaxeIcon.BackgroundColor3 = CosmicUI.Colors.Stardust
	end
end

local function updatePlanetInfo()
	local planetVal = ReplicatedStorage:FindFirstChild("CurrentPlanet")
	local systemVal = ReplicatedStorage:FindFirstChild("CurrentSystem")
	if planetVal and planetVal:IsA("StringValue") then
		currentPlanet = planetVal.Value
	end
	if systemVal and systemVal:IsA("StringValue") then
		currentSystem = systemVal.Value
	end
end

-- Coin count-up animation (frame-by-frame via Heartbeat, ease-out cubic)
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
		-- Ease-out cubic
		alpha = 1 - (1 - alpha) ^ 3
		displayedCoins = math.floor(start + diff * alpha)
		coinLabel.Text = CosmicUI.formatNumber(displayedCoins)
		if alpha >= 1 then
			displayedCoins = target
			coinLabel.Text = CosmicUI.formatNumber(target)
			if countUpConnection then
				countUpConnection:Disconnect()
				countUpConnection = nil
			end
		end
	end)
end

local function coinBounce()
	-- Panel spring scale bounce: 1 -> 1.08 -> 1
	local targetSize = coinPanel.Size
	local bigSize = UDim2.new(
		targetSize.X.Scale, math.round(targetSize.X.Offset * 1.08),
		targetSize.Y.Scale, math.round(targetSize.Y.Offset * 1.08)
	)
	coinPanel.Size = bigSize
	CosmicUI.spring(coinPanel, { Size = targetSize }, "Snappy")
end

local function coinBigGainFlash()
	-- Golden flash on the coin icon glow
	local glow = coinIcon:FindFirstChild("Glow")
	if glow then
		glow.ImageTransparency = 0.2
		CosmicUI.spring(glow, { ImageTransparency = 0.6 }, "Gentle")
	end
end

local function levelUpFlash()
	-- Badge color flash to gold then back
	levelBadge.BackgroundColor3 = CosmicUI.Colors.SolarGold
	task.delay(0.4, function()
		-- Spring back badge color not supported, use tween for color
		TweenService:Create(levelBadge, TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
			BackgroundColor3 = CosmicUI.Colors.Stardust,
		}):Play()
	end)

	-- XP fill flash gold
	local gradient = xpFill:FindFirstChildOfClass("UIGradient")
	if gradient then
		gradient.Color = ColorSequence.new(CosmicUI.Colors.SolarGold, CosmicUI.Colors.SolarGold)
		task.delay(0.3, function()
			TweenService:Create(gradient, TweenInfo.new(0.5), {
				Color = ColorSequence.new(CosmicUI.Colors.CosmicBlue, CosmicUI.Colors.NebulaCyan),
			}):Play()
		end)
	end

	-- Level badge scale bounce (Elastic)
	local targetSize = levelBadge.Size
	levelBadge.Size = UDim2.new(
		targetSize.X.Scale * 1.5, math.round(targetSize.X.Offset * 1.5),
		targetSize.Y.Scale * 1.5, math.round(targetSize.Y.Offset * 1.5)
	)
	CosmicUI.spring(levelBadge, { Size = targetSize }, "Elastic")
end

---------------------------------------------------------------------------
-- 9. EVENT CONNECTIONS
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
		-- Big gain flash
		if amount > 1000 then
			coinBigGainFlash()
		end
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
