--[[
	NotificationClient.lua
	StarterPlayerScripts LocalScript
	Production-ready notification/feedback system for Planet Miner
	Bouncy, juicy, satisfying — inspired by Pet Simulator X / Blox Fruits style
]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local camera = workspace.CurrentCamera

-----------------------------------------------------------------------
-- PALETTE
-----------------------------------------------------------------------
local COLORS = {
	panelBG    = Color3.fromRGB(12, 14, 30),
	accent     = Color3.fromRGB(120, 90, 230),
	gold       = Color3.fromRGB(255, 210, 50),
	green      = Color3.fromRGB(80, 210, 130),
	textPri    = Color3.fromRGB(240, 240, 255),
	errorRed   = Color3.fromRGB(232, 80, 64),
}

local MAT_COLORS = {
	Stone         = Color3.fromRGB(140, 140, 140),
	Copper        = Color3.fromRGB(210, 120, 60),
	Iron          = Color3.fromRGB(180, 180, 200),
	Silver        = Color3.fromRGB(200, 210, 230),
	Gold          = Color3.fromRGB(255, 210, 50),
	Crystal       = Color3.fromRGB(100, 200, 255),
	["Star Ore"]  = Color3.fromRGB(200, 100, 255),
	Obsidian      = Color3.fromRGB(80, 60, 100),
	Titanium      = Color3.fromRGB(180, 200, 220),
	Platinum      = Color3.fromRGB(220, 220, 240),
	Ruby          = Color3.fromRGB(220, 40, 60),
	Sapphire      = Color3.fromRGB(40, 80, 220),
	Diamond       = Color3.fromRGB(180, 240, 255),
	Nebulite      = Color3.fromRGB(140, 60, 200),
	Voidstone     = Color3.fromRGB(60, 30, 80),
	Aether        = Color3.fromRGB(200, 255, 220),
	Cosmium       = Color3.fromRGB(255, 120, 200),
	Solarium      = Color3.fromRGB(255, 200, 80),
	Novastone     = Color3.fromRGB(255, 100, 50),
	["Dark Matter"] = Color3.fromRGB(60, 20, 80),
	Eternium      = Color3.fromRGB(255, 255, 220),
}

-----------------------------------------------------------------------
-- SCREEN GUI
-----------------------------------------------------------------------
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "NotificationGui"
screenGui.ResetOnSpawn = false
screenGui.DisplayOrder = 100
screenGui.IgnoreGuiInset = true
screenGui.Parent = playerGui

-- Layers
local coinLayer = Instance.new("Frame")
coinLayer.Name = "CoinLayer"
coinLayer.Size = UDim2.new(1, 0, 1, 0)
coinLayer.BackgroundTransparency = 1
coinLayer.Parent = screenGui

local materialLayer = Instance.new("Frame")
materialLayer.Name = "MaterialLayer"
materialLayer.AnchorPoint = Vector2.new(1, 1)
materialLayer.Position = UDim2.new(1, -20, 1, -120)
materialLayer.Size = UDim2.new(0, 300, 0, 250)
materialLayer.BackgroundTransparency = 1
materialLayer.Parent = screenGui

local toastLayer = Instance.new("Frame")
toastLayer.Name = "ToastLayer"
toastLayer.AnchorPoint = Vector2.new(0.5, 0)
toastLayer.Position = UDim2.new(0.5, 0, 0, 20)
toastLayer.Size = UDim2.new(0, 400, 0, 300)
toastLayer.BackgroundTransparency = 1
toastLayer.Parent = screenGui

local flashFrame = Instance.new("Frame")
flashFrame.Name = "FlashFrame"
flashFrame.Size = UDim2.new(1, 0, 1, 0)
flashFrame.BackgroundColor3 = Color3.new(1, 1, 1)
flashFrame.BackgroundTransparency = 1
flashFrame.ZIndex = 50
flashFrame.Parent = screenGui

local levelUpLayer = Instance.new("Frame")
levelUpLayer.Name = "LevelUpLayer"
levelUpLayer.Size = UDim2.new(1, 0, 1, 0)
levelUpLayer.BackgroundTransparency = 1
levelUpLayer.ZIndex = 40
levelUpLayer.Parent = screenGui

-----------------------------------------------------------------------
-- HELPERS
-----------------------------------------------------------------------
local function tweenNew(obj, info, props)
	local t = TweenService:Create(obj, info, props)
	t:Play()
	return t
end

local function formatNumber(n)
	if n >= 1000000 then
		return string.format("%.1fM", n / 1000000)
	elseif n >= 1000 then
		return string.format("%.1fK", n / 1000)
	end
	return tostring(n)
end

local function makeCorner(parent, radius)
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0, radius or 8)
	c.Parent = parent
	return c
end

local function makeStroke(parent, color, thickness)
	local s = Instance.new("UIStroke")
	s.Color = color or COLORS.accent
	s.Thickness = thickness or 1.5
	s.Transparency = 0.4
	s.Parent = parent
	return s
end

-----------------------------------------------------------------------
-- EASING: Back-style bounce-in
-----------------------------------------------------------------------
local BACK_TWEEN_IN = TweenInfo.new(0.45, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
local ELASTIC_TWEEN_IN = TweenInfo.new(0.55, Enum.EasingStyle.Elastic, Enum.EasingDirection.Out)
local FADE_OUT = TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.In)

-----------------------------------------------------------------------
-- 1. COIN GAIN POPUP
-----------------------------------------------------------------------
local activeCoinPopups = {}

local function showCoinGain(amount)
	if not amount or amount <= 0 then return end

	local isBig = amount >= 1000
	local fontSize = isBig and 36 or 26

	local label = Instance.new("TextLabel")
	label.Name = "CoinPopup"
	label.Font = Enum.Font.FredokaOne
	label.Text = "+" .. formatNumber(amount) .. " Coins"
	label.TextColor3 = COLORS.gold
	label.TextStrokeColor3 = Color3.fromRGB(80, 60, 0)
	label.TextStrokeTransparency = 0.3
	label.TextSize = fontSize
	label.BackgroundTransparency = 1
	label.AnchorPoint = Vector2.new(0.5, 0.5)
	label.Size = UDim2.new(0, 350, 0, 50)
	label.TextTransparency = 0

	-- Stack offset
	local stackY = 0
	for _, popup in ipairs(activeCoinPopups) do
		if popup and popup.Parent then
			stackY = stackY + 45
		end
	end

	local startY = 0.45 - (stackY / 1000)
	label.Position = UDim2.new(0.5, 0, startY, 0)
	label.Parent = coinLayer

	-- Scale bounce in
	label.Size = UDim2.new(0, 0, 0, 0)
	tweenNew(label, BACK_TWEEN_IN, {
		Size = UDim2.new(0, 350, 0, 50),
	})

	-- Glow for big amounts
	if isBig then
		local glow = Instance.new("UIStroke")
		glow.Color = COLORS.gold
		glow.Thickness = 3
		glow.Transparency = 0.2
		glow.Parent = label

		tweenNew(glow, TweenInfo.new(0.8, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, 2, true), {
			Thickness = 6,
			Transparency = 0.6,
		})
	end

	table.insert(activeCoinPopups, label)

	-- Float up and fade
	task.delay(0.5, function()
		local fadeInfo = TweenInfo.new(1.2, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		tweenNew(label, fadeInfo, {
			Position = UDim2.new(0.5, 0, startY - 0.08, 0),
			TextTransparency = 1,
			TextStrokeTransparency = 1,
		})
		task.delay(1.3, function()
			for i, v in ipairs(activeCoinPopups) do
				if v == label then
					table.remove(activeCoinPopups, i)
					break
				end
			end
			label:Destroy()
		end)
	end)
end

-----------------------------------------------------------------------
-- 2. MATERIAL PICKUP INDICATOR
-----------------------------------------------------------------------
local activeMaterialToasts = {}
local MAX_MATERIAL_TOASTS = 5

local function showMaterialPickup(materialName, amount)
	if not materialName or not amount or amount <= 0 then return end

	local matColor = MAT_COLORS[materialName] or COLORS.textPri

	-- Container
	local toast = Instance.new("Frame")
	toast.Name = "MatToast"
	toast.Size = UDim2.new(1, 0, 0, 36)
	toast.BackgroundColor3 = COLORS.panelBG
	toast.BackgroundTransparency = 0.15
	toast.AnchorPoint = Vector2.new(1, 1)
	toast.Position = UDim2.new(1, 60, 1, 0) -- start offscreen right
	toast.ClipsDescendants = false
	makeCorner(toast, 6)
	makeStroke(toast, matColor, 1.5)

	-- Color indicator bar
	local bar = Instance.new("Frame")
	bar.Size = UDim2.new(0, 4, 0.7, 0)
	bar.AnchorPoint = Vector2.new(0, 0.5)
	bar.Position = UDim2.new(0, 8, 0.5, 0)
	bar.BackgroundColor3 = matColor
	bar.BorderSizePixel = 0
	bar.Parent = toast
	makeCorner(bar, 2)

	-- Text
	local label = Instance.new("TextLabel")
	label.Font = Enum.Font.FredokaOne
	label.Text = "+" .. tostring(amount) .. " " .. materialName
	label.TextColor3 = matColor
	label.TextSize = 18
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.BackgroundTransparency = 1
	label.Size = UDim2.new(1, -24, 1, 0)
	label.Position = UDim2.new(0, 20, 0, 0)
	label.Parent = toast

	-- Remove oldest if over max
	while #activeMaterialToasts >= MAX_MATERIAL_TOASTS do
		local oldest = table.remove(activeMaterialToasts, 1)
		if oldest and oldest.Parent then
			oldest:Destroy()
		end
	end

	-- Push existing toasts up
	for i, existing in ipairs(activeMaterialToasts) do
		if existing and existing.Parent then
			local targetY = 1 - (#activeMaterialToasts - i + 1) * 42
			tweenNew(existing, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
				Position = UDim2.new(0, 0, 0, targetY),
			})
		end
	end

	-- Place new toast at bottom
	toast.Position = UDim2.new(1, 60, 1, 0)
	toast.Parent = materialLayer
	table.insert(activeMaterialToasts, toast)

	-- Slide in from right
	tweenNew(toast, BACK_TWEEN_IN, {
		Position = UDim2.new(0, 0, 1, 0),
	})

	-- Auto dismiss
	task.delay(2.5, function()
		local slideOut = TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		tweenNew(toast, slideOut, {
			Position = UDim2.new(1, 60, 1, 0),
		})
		task.delay(0.4, function()
			for i, v in ipairs(activeMaterialToasts) do
				if v == toast then
					table.remove(activeMaterialToasts, i)
					break
				end
			end
			toast:Destroy()
		end)
	end)
end

-----------------------------------------------------------------------
-- 3. LEVEL UP CELEBRATION
-----------------------------------------------------------------------
local function showLevelUp(newLevel)
	if not newLevel then return end

	-- Flash
	screenFlash(COLORS.gold, 0.3)

	-- TODO: Play level-up sound here
	-- print("[NotificationClient] SOUND TRIGGER: LevelUp")

	-- Container
	local container = Instance.new("Frame")
	container.Name = "LevelUpCelebration"
	container.Size = UDim2.new(1, 0, 1, 0)
	container.BackgroundTransparency = 1
	container.ZIndex = 41
	container.Parent = levelUpLayer

	-- Dim overlay
	local overlay = Instance.new("Frame")
	overlay.Size = UDim2.new(1, 0, 1, 0)
	overlay.BackgroundColor3 = Color3.new(0, 0, 0)
	overlay.BackgroundTransparency = 1
	overlay.ZIndex = 41
	overlay.Parent = container

	tweenNew(overlay, TweenInfo.new(0.3, Enum.EasingStyle.Quad), {
		BackgroundTransparency = 0.6,
	})

	-- "LEVEL UP!" text
	local titleLabel = Instance.new("TextLabel")
	titleLabel.Font = Enum.Font.FredokaOne
	titleLabel.Text = "LEVEL UP!"
	titleLabel.TextColor3 = COLORS.gold
	titleLabel.TextStrokeColor3 = Color3.fromRGB(100, 70, 0)
	titleLabel.TextStrokeTransparency = 0.1
	titleLabel.TextSize = 72
	titleLabel.BackgroundTransparency = 1
	titleLabel.AnchorPoint = Vector2.new(0.5, 0.5)
	titleLabel.Position = UDim2.new(0.5, 0, 0.4, 0)
	titleLabel.Size = UDim2.new(0, 500, 0, 90)
	titleLabel.ZIndex = 42
	titleLabel.Parent = container

	-- Scale bounce
	titleLabel.TextTransparency = 1
	titleLabel.TextStrokeTransparency = 1
	local titleScale = Instance.new("UIScale")
	titleScale.Scale = 0
	titleScale.Parent = titleLabel

	tweenNew(titleScale, ELASTIC_TWEEN_IN, { Scale = 1 })
	tweenNew(titleLabel, TweenInfo.new(0.25), {
		TextTransparency = 0,
		TextStrokeTransparency = 0.1,
	})

	-- Level number
	local levelLabel = Instance.new("TextLabel")
	levelLabel.Font = Enum.Font.FredokaOne
	levelLabel.Text = "Level " .. tostring(newLevel)
	levelLabel.TextColor3 = COLORS.textPri
	levelLabel.TextStrokeColor3 = COLORS.accent
	levelLabel.TextStrokeTransparency = 0.4
	levelLabel.TextSize = 36
	levelLabel.BackgroundTransparency = 1
	levelLabel.AnchorPoint = Vector2.new(0.5, 0.5)
	levelLabel.Position = UDim2.new(0.5, 0, 0.5, 0)
	levelLabel.Size = UDim2.new(0, 300, 0, 50)
	levelLabel.ZIndex = 42
	levelLabel.TextTransparency = 1
	levelLabel.Parent = container

	task.delay(0.3, function()
		tweenNew(levelLabel, BACK_TWEEN_IN, {
			TextTransparency = 0,
			TextStrokeTransparency = 0.4,
		})
	end)

	-- Gold particles (simulated with small frames)
	local particleCount = 20
	local rng = Random.new()
	for i = 1, particleCount do
		local particle = Instance.new("Frame")
		particle.Size = UDim2.new(0, rng:NextInteger(4, 10), 0, rng:NextInteger(4, 10))
		particle.AnchorPoint = Vector2.new(0.5, 0.5)
		particle.Position = UDim2.new(0.5, 0, 0.45, 0)
		particle.BackgroundColor3 = Color3.fromRGB(
			rng:NextInteger(200, 255),
			rng:NextInteger(170, 230),
			rng:NextInteger(20, 80)
		)
		particle.Rotation = rng:NextNumber(0, 360)
		particle.ZIndex = 42
		particle.Parent = container
		makeCorner(particle, 3)

		local angle = rng:NextNumber(0, math.pi * 2)
		local dist = rng:NextNumber(150, 400)
		local targetX = 0.5 + math.cos(angle) * dist / 1000
		local targetY = 0.45 + math.sin(angle) * dist / 1000

		local dur = rng:NextNumber(0.6, 1.2)
		tweenNew(particle, TweenInfo.new(dur, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
			Position = UDim2.new(targetX, 0, targetY, 0),
			BackgroundTransparency = 1,
			Rotation = rng:NextNumber(-180, 180),
		})
	end

	-- Dismiss after 2.5s
	task.delay(2.5, function()
		local fadeInfo = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		tweenNew(overlay, fadeInfo, { BackgroundTransparency = 1 })
		tweenNew(titleLabel, fadeInfo, { TextTransparency = 1, TextStrokeTransparency = 1 })
		tweenNew(levelLabel, fadeInfo, { TextTransparency = 1, TextStrokeTransparency = 1 })

		task.delay(0.6, function()
			container:Destroy()
		end)
	end)
end

-----------------------------------------------------------------------
-- 4. ACHIEVEMENT / INFO TOAST
-----------------------------------------------------------------------
local activeToasts = {}

local function showToast(text, color)
	if not text then return end
	color = color or COLORS.accent

	local toast = Instance.new("Frame")
	toast.Name = "InfoToast"
	toast.Size = UDim2.new(1, 0, 0, 44)
	toast.BackgroundColor3 = COLORS.panelBG
	toast.BackgroundTransparency = 0.08
	toast.AnchorPoint = Vector2.new(0.5, 0)
	toast.Position = UDim2.new(0.5, 0, 0, -50) -- start above screen
	toast.ClipsDescendants = false
	makeCorner(toast, 10)
	makeStroke(toast, color, 1.5)

	-- Icon circle
	local icon = Instance.new("Frame")
	icon.Size = UDim2.new(0, 22, 0, 22)
	icon.AnchorPoint = Vector2.new(0, 0.5)
	icon.Position = UDim2.new(0, 12, 0.5, 0)
	icon.BackgroundColor3 = color
	icon.Parent = toast
	makeCorner(icon, 11)

	-- Inner dot
	local dot = Instance.new("Frame")
	dot.Size = UDim2.new(0, 8, 0, 8)
	dot.AnchorPoint = Vector2.new(0.5, 0.5)
	dot.Position = UDim2.new(0.5, 0, 0.5, 0)
	dot.BackgroundColor3 = COLORS.textPri
	dot.Parent = icon
	makeCorner(dot, 4)

	-- Text
	local label = Instance.new("TextLabel")
	label.Font = Enum.Font.FredokaOne
	label.Text = text
	label.TextColor3 = COLORS.textPri
	label.TextSize = 18
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.BackgroundTransparency = 1
	label.Size = UDim2.new(1, -50, 1, 0)
	label.Position = UDim2.new(0, 42, 0, 0)
	label.TextTruncate = Enum.TextTruncate.AtEnd
	label.Parent = toast

	-- Push existing toasts down
	for i, existing in ipairs(activeToasts) do
		if existing and existing.Parent then
			local targetY = (#activeToasts - i + 1) * 52
			tweenNew(existing, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
				Position = UDim2.new(0.5, 0, 0, targetY),
			})
		end
	end

	toast.Parent = toastLayer
	table.insert(activeToasts, toast)

	-- Slide in with bounce
	tweenNew(toast, BACK_TWEEN_IN, {
		Position = UDim2.new(0.5, 0, 0, 0),
	})

	-- Auto dismiss
	task.delay(3, function()
		local slideOut = TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		tweenNew(toast, slideOut, {
			Position = UDim2.new(0.5, 0, 0, -50),
		})
		task.delay(0.4, function()
			for i, v in ipairs(activeToasts) do
				if v == toast then
					table.remove(activeToasts, i)
					break
				end
			end
			toast:Destroy()
		end)
	end)
end

-----------------------------------------------------------------------
-- 5. SCREEN EFFECTS
-----------------------------------------------------------------------
function screenFlash(color, duration)
	color = color or Color3.new(1, 1, 1)
	duration = duration or 0.25

	flashFrame.BackgroundColor3 = color
	flashFrame.BackgroundTransparency = 0.4

	tweenNew(flashFrame, TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
		BackgroundTransparency = 1,
	})
end

local shaking = false
local shakeOffset = CFrame.new()

local function screenShake(intensity, duration)
	intensity = intensity or 5
	duration = duration or 0.3

	if shaking then return end
	shaking = true

	local rng = Random.new()
	local elapsed = 0
	local connection
	connection = RunService.RenderStepped:Connect(function(dt)
		elapsed = elapsed + dt
		if elapsed >= duration then
			shaking = false
			shakeOffset = CFrame.new()
			connection:Disconnect()
			return
		end

		local progress = 1 - (elapsed / duration)
		local mag = intensity * progress
		shakeOffset = CFrame.new(
			rng:NextNumber(-mag, mag),
			rng:NextNumber(-mag, mag),
			0
		)
	end)
end

-- Apply shake offset to camera
RunService.RenderStepped:Connect(function()
	if shaking and camera then
		camera.CFrame = camera.CFrame * shakeOffset
	end
end)

-----------------------------------------------------------------------
-- REMOTE EVENT CONNECTIONS (direct children of ReplicatedStorage)
-----------------------------------------------------------------------
local lastKnownCoins = nil

local coinsGiven = ReplicatedStorage:WaitForChild("CoinsGiven", 10)
local materialGiven = ReplicatedStorage:WaitForChild("MaterialGiven", 10)
local levelUpEvent = ReplicatedStorage:WaitForChild("LevelUp", 10)
local shopDataUpdate = ReplicatedStorage:WaitForChild("ShopDataUpdate", 10)
local playerDataLoaded = ReplicatedStorage:WaitForChild("PlayerDataLoaded", 10)

if coinsGiven then
	coinsGiven.OnClientEvent:Connect(function(amount)
		if amount and type(amount) == "number" then
			showCoinGain(amount)
		end
	end)
end

if materialGiven then
	materialGiven.OnClientEvent:Connect(function(materialName, amount)
		if materialName and amount then
			showMaterialPickup(tostring(materialName), tonumber(amount) or 1)
		end
	end)
end

if levelUpEvent then
	levelUpEvent.OnClientEvent:Connect(function(newLevel)
		if newLevel and type(newLevel) == "number" then
			showLevelUp(newLevel)
		end
	end)
end

if shopDataUpdate then
	shopDataUpdate.OnClientEvent:Connect(function(materials, newCoins)
		if newCoins and type(newCoins) == "number" then
			if lastKnownCoins then
				local delta = newCoins - lastKnownCoins
				if delta > 0 then
					showCoinGain(delta)
				end
			end
			lastKnownCoins = newCoins
		end
	end)
end

if playerDataLoaded then
	playerDataLoaded.OnClientEvent:Connect(function(data)
		if data and data.coins then
			lastKnownCoins = data.coins
		end
	end)
end

-----------------------------------------------------------------------
-- EXPOSED API (via _G for cross-script access)
-----------------------------------------------------------------------
local NotificationAPI = {
	showCoinGain = showCoinGain,
	showMaterialPickup = showMaterialPickup,
	showLevelUp = showLevelUp,
	showToast = showToast,
	screenFlash = screenFlash,
	screenShake = screenShake,
}

_G.NotificationAPI = NotificationAPI

-----------------------------------------------------------------------
-- INIT
-----------------------------------------------------------------------
print("[NotificationClient] Notification system loaded")
