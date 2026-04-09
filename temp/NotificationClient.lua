--[[
	NotificationClient.lua
	StarterPlayerScripts LocalScript
	Cosmic Glass notification/feedback system for Planet Miner
	Uses CosmicUI design system for consistent styling and spring animations
]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local CosmicUI = require(script.Parent:WaitForChild("CosmicUI"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local camera = workspace.CurrentCamera

-----------------------------------------------------------------------
-- MATERIAL COLORS (21 materials)
-----------------------------------------------------------------------
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
-- SCREEN GUI + LAYERS
-----------------------------------------------------------------------
local screenGui = CosmicUI.create("ScreenGui", {
	Name = "NotificationGui",
	ResetOnSpawn = false,
	DisplayOrder = 100,
	IgnoreGuiInset = true,
	Parent = playerGui,
})

local coinLayer = CosmicUI.create("Frame", {
	Name = "CoinLayer",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Parent = screenGui,
})

local materialLayer = CosmicUI.create("Frame", {
	Name = "MaterialLayer",
	AnchorPoint = Vector2.new(1, 1),
	Position = UDim2.new(1, -20, 1, -120),
	Size = UDim2.new(0, 300, 0, 280),
	BackgroundTransparency = 1,
	Parent = screenGui,
})

local toastLayer = CosmicUI.create("Frame", {
	Name = "ToastLayer",
	AnchorPoint = Vector2.new(0.5, 0),
	Position = UDim2.new(0.5, 0, 0, 20),
	Size = UDim2.new(0, 400, 0, 200),
	BackgroundTransparency = 1,
	Parent = screenGui,
})

local levelUpLayer = CosmicUI.create("Frame", {
	Name = "LevelUpLayer",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	ZIndex = 40,
	Parent = screenGui,
})

local flashFrame = CosmicUI.create("Frame", {
	Name = "FlashFrame",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundColor3 = Color3.new(1, 1, 1),
	BackgroundTransparency = 1,
	ZIndex = 50,
	Parent = screenGui,
})

local damageLayer = CosmicUI.create("Frame", {
	Name = "DamageLayer",
	Size = UDim2.new(1, 0, 1, 0),
	BackgroundTransparency = 1,
	Parent = screenGui,
})

-----------------------------------------------------------------------
-- CONSTANTS
-----------------------------------------------------------------------
local FONT_FREDOKA = Enum.Font.FredokaOne
local MAX_MATERIAL_TOASTS = 5
local MAX_INFO_TOASTS = 3
local MATERIAL_DISMISS_TIME = 2.5
local INFO_DISMISS_TIME = 3
local RNG = Random.new()

-----------------------------------------------------------------------
-- 1. DAMAGE NUMBERS
-----------------------------------------------------------------------
local function showDamageNumber(screenPos: Vector2, amount: number, isCrit: boolean)
	if not screenPos or not amount then return end

	local fontSize = isCrit and CosmicUI.fontSize("Title") or CosmicUI.fontSize("Body")
	local textColor = isCrit and CosmicUI.Colors.SolarGold or CosmicUI.Colors.SupernovaRed
	local displayText = "-" .. tostring(math.floor(amount))

	local xOffset = RNG:NextInteger(-10, 10)

	local label = CosmicUI.create("TextLabel", {
		Name = "DamageNumber",
		Font = FONT_FREDOKA,
		Text = displayText,
		TextColor3 = textColor,
		TextStrokeColor3 = CosmicUI.Colors.Void,
		TextStrokeTransparency = 0.2,
		TextSize = fontSize,
		BackgroundTransparency = 1,
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0, screenPos.X + xOffset, 0, screenPos.Y),
		Size = UDim2.new(0, 200, 0, 50),
		Parent = damageLayer,
	})

	-- Crit label above damage number
	local critLabel = nil
	if isCrit then
		critLabel = CosmicUI.create("TextLabel", {
			Name = "CritLabel",
			Font = FONT_FREDOKA,
			Text = "CRIT!",
			TextColor3 = CosmicUI.Colors.SolarGold,
			TextStrokeColor3 = CosmicUI.Colors.Void,
			TextStrokeTransparency = 0.2,
			TextSize = math.floor(fontSize * 0.7),
			BackgroundTransparency = 1,
			AnchorPoint = Vector2.new(0.5, 1),
			Position = UDim2.new(0.5, 0, 0, -4),
			Size = UDim2.new(1, 0, 0, 30),
			Parent = label,
		})
	end

	-- Animate: float up 30px + scale 1.2 -> 0.8 + fade out over 0.6s
	local startY = screenPos.Y
	local elapsed = 0
	local duration = 0.6
	local startScale = 1.2
	local endScale = 0.8

	local connection
	connection = RunService.Heartbeat:Connect(function(dt)
		elapsed = elapsed + dt
		local progress = math.min(elapsed / duration, 1)

		-- Float up
		local yOffset = progress * 30
		label.Position = UDim2.new(0, screenPos.X + xOffset, 0, startY - yOffset)

		-- Scale interpolation
		local currentScale = startScale + (endScale - startScale) * progress
		label.TextSize = math.floor(fontSize * currentScale)
		if critLabel then
			critLabel.TextSize = math.floor(fontSize * 0.7 * currentScale)
		end

		-- Fade out (accelerated in second half)
		local fadeProgress = math.clamp((progress - 0.3) / 0.7, 0, 1)
		label.TextTransparency = fadeProgress
		label.TextStrokeTransparency = 0.2 + fadeProgress * 0.8
		if critLabel then
			critLabel.TextTransparency = fadeProgress
			critLabel.TextStrokeTransparency = 0.2 + fadeProgress * 0.8
		end

		if progress >= 1 then
			connection:Disconnect()
			label:Destroy()
		end
	end)
end

-----------------------------------------------------------------------
-- 2. MATERIAL PICKUP TOAST (Bottom-Right Stack with Duplicate Merge)
-----------------------------------------------------------------------
local activeMaterialToasts = {} -- { frame, materialName, amount, label, dismissThread }

local function repositionMaterialToasts()
	for i, entry in ipairs(activeMaterialToasts) do
		if entry.frame and entry.frame.Parent then
			local indexFromBottom = #activeMaterialToasts - i
			local targetY = -(indexFromBottom * 44)
			CosmicUI.spring(entry.frame, {
				Position = UDim2.new(0, 0, 1, targetY),
			}, "Gentle")
		end
	end
end

local function removeMaterialToast(entry)
	for i, v in ipairs(activeMaterialToasts) do
		if v == entry then
			table.remove(activeMaterialToasts, i)
			break
		end
	end
	if entry.frame and entry.frame.Parent then
		CosmicUI.slideOut(entry.frame, "right", function()
			entry.frame:Destroy()
		end)
	end
	task.defer(repositionMaterialToasts)
end

local function showMaterialPickup(materialName: string, amount: number)
	if not materialName or not amount or amount <= 0 then return end

	local matColor = MAT_COLORS[materialName] or CosmicUI.Colors.PulsarWhite

	-- Check for duplicate: merge into existing toast
	for _, entry in ipairs(activeMaterialToasts) do
		if entry.materialName == materialName and entry.frame and entry.frame.Parent then
			entry.amount = entry.amount + amount
			entry.label.Text = "+" .. tostring(entry.amount) .. " " .. materialName

			-- Pulse via spring Snappy scale
			local scale = entry.frame:FindFirstChildOfClass("UIScale")
			if scale then
				scale.Scale = 1.15
				CosmicUI.spring(scale, { Scale = 1 }, "Snappy")
			end

			-- Reset dismiss timer
			if entry.dismissThread then
				task.cancel(entry.dismissThread)
			end
			entry.dismissThread = task.delay(MATERIAL_DISMISS_TIME, function()
				removeMaterialToast(entry)
			end)
			return
		end
	end

	-- Remove oldest if over max
	while #activeMaterialToasts >= MAX_MATERIAL_TOASTS do
		local oldest = activeMaterialToasts[1]
		if oldest.dismissThread then
			task.cancel(oldest.dismissThread)
		end
		table.remove(activeMaterialToasts, 1)
		if oldest.frame and oldest.frame.Parent then
			oldest.frame:Destroy()
		end
	end

	-- Create new toast panel
	local toast = CosmicUI.panel({
		name = "MatToast",
		size = UDim2.new(1, 0, 0, 38),
		position = UDim2.new(1, 60, 1, 0), -- start offscreen right
		anchorPoint = Vector2.new(1, 1),
		strokeColor = matColor,
		radius = CosmicUI.Radius.Small,
		transparency = 0.12,
		parent = materialLayer,
	})

	-- UIScale for pulse animation on merge
	CosmicUI.create("UIScale", {
		Scale = 1,
		Parent = toast,
	})

	-- Color indicator bar (left side)
	local bar = CosmicUI.create("Frame", {
		Name = "ColorBar",
		Size = UDim2.new(0, 4, 0.65, 0),
		AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.new(0, 8, 0.5, 0),
		BackgroundColor3 = matColor,
		BorderSizePixel = 0,
		Parent = toast,
	})
	CosmicUI.create("UICorner", {
		CornerRadius = UDim.new(0, 2),
		Parent = bar,
	})

	-- Text label
	local label = CosmicUI.create("TextLabel", {
		Name = "MatText",
		Font = FONT_FREDOKA,
		Text = "+" .. tostring(amount) .. " " .. materialName,
		TextColor3 = matColor,
		TextSize = CosmicUI.fontSize("Body"),
		TextXAlignment = Enum.TextXAlignment.Left,
		BackgroundTransparency = 1,
		Size = UDim2.new(1, -24, 1, 0),
		Position = UDim2.new(0, 20, 0, 0),
		Parent = toast,
	})

	local entry = {
		frame = toast,
		materialName = materialName,
		amount = amount,
		label = label,
		dismissThread = nil,
	}

	table.insert(activeMaterialToasts, entry)

	-- Slide in from right with spring
	CosmicUI.spring(toast, {
		Position = UDim2.new(0, 0, 1, 0),
	}, "Bouncy")

	-- Reposition all toasts
	task.defer(repositionMaterialToasts)

	-- Auto dismiss
	entry.dismissThread = task.delay(MATERIAL_DISMISS_TIME, function()
		removeMaterialToast(entry)
	end)
end

-----------------------------------------------------------------------
-- 3. COIN GAIN POPUP (Center Screen)
-----------------------------------------------------------------------
local activeCoinPopups = {}

local function showCoinGain(amount: number)
	if not amount or amount <= 0 then return end

	local isBig = amount >= 1000
	local fontSize = isBig and CosmicUI.fontSize("Title") or CosmicUI.fontSize("Body")

	-- Stack offset
	local stackY = 0
	for _, popup in ipairs(activeCoinPopups) do
		if popup and popup.Parent then
			stackY = stackY + 45
		end
	end

	local startY = 0.45 - (stackY / 1000)

	local label = CosmicUI.create("TextLabel", {
		Name = "CoinPopup",
		Font = FONT_FREDOKA,
		Text = "+" .. CosmicUI.formatNumber(amount) .. " Coins",
		TextColor3 = CosmicUI.Colors.SolarGold,
		TextStrokeColor3 = Color3.fromRGB(80, 60, 0),
		TextStrokeTransparency = 0.3,
		TextSize = fontSize,
		BackgroundTransparency = 1,
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, startY, 0),
		Size = UDim2.new(0, 350, 0, 50),
		TextTransparency = 0,
		Parent = coinLayer,
	})

	-- Spring Snappy pop-in via UIScale
	local uiScale = CosmicUI.create("UIScale", {
		Scale = 0,
		Parent = label,
	})
	CosmicUI.spring(uiScale, { Scale = 1 }, "Snappy")

	-- Gold glow particles for big amounts
	if isBig then
		local particleCount = RNG:NextInteger(5, 8)
		for i = 1, particleCount do
			local particle = CosmicUI.create("Frame", {
				Name = "GlowParticle",
				Size = UDim2.new(0, RNG:NextInteger(4, 8), 0, RNG:NextInteger(4, 8)),
				AnchorPoint = Vector2.new(0.5, 0.5),
				Position = UDim2.new(0.5, 0, 0.5, 0),
				BackgroundColor3 = CosmicUI.Colors.SolarGold,
				BackgroundTransparency = 0.3,
				Parent = label,
			})
			CosmicUI.create("UICorner", {
				CornerRadius = UDim.new(0.5, 0),
				Parent = particle,
			})

			local angle = RNG:NextNumber(0, math.pi * 2)
			local dist = RNG:NextInteger(40, 100)
			local targetX = 0.5 + math.cos(angle) * dist / 350
			local targetY = 0.5 + math.sin(angle) * dist / 50
			local dur = RNG:NextNumber(0.5, 0.9)

			TweenService:Create(particle, TweenInfo.new(dur, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
				Position = UDim2.new(targetX, 0, targetY, 0),
				BackgroundTransparency = 1,
				Size = UDim2.new(0, 2, 0, 2),
			}):Play()
		end
	end

	table.insert(activeCoinPopups, label)

	-- Float up 80px + fade over 1.2s (after initial pop)
	task.delay(0.2, function()
		local fadeInfo = TweenInfo.new(1.2, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		TweenService:Create(label, fadeInfo, {
			Position = UDim2.new(0.5, 0, startY - 0.08, 0),
			TextTransparency = 1,
			TextStrokeTransparency = 1,
		}):Play()

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
-- 4. LEVEL-UP CELEBRATION (3-second signature moment)
-----------------------------------------------------------------------
local function showLevelUp(newLevel: number, unlockInfo: string?)
	if not newLevel then return end

	-- 0.00s — Screen flash
	screenFlash(CosmicUI.Colors.SolarGold, 0.15)

	-- 0.05s — Screen shake
	task.delay(0.05, function()
		screenShake(5, 0.3)
	end)

	-- Container
	local container = CosmicUI.create("Frame", {
		Name = "LevelUpCelebration",
		Size = UDim2.new(1, 0, 1, 0),
		BackgroundTransparency = 1,
		ZIndex = 41,
		Parent = levelUpLayer,
	})

	-- 0.10s — Background dim
	local overlay = CosmicUI.create("Frame", {
		Name = "DimOverlay",
		Size = UDim2.new(1, 0, 1, 0),
		BackgroundColor3 = Color3.new(0, 0, 0),
		BackgroundTransparency = 1,
		ZIndex = 41,
		Parent = container,
	})

	task.delay(0.10, function()
		TweenService:Create(overlay, TweenInfo.new(0.2, Enum.EasingStyle.Quad), {
			BackgroundTransparency = 0.3,
		}):Play()
	end)

	-- 0.15s — "LEVEL UP!" text with spring Elastic
	local titleLabel = CosmicUI.create("TextLabel", {
		Name = "LevelUpTitle",
		Font = FONT_FREDOKA,
		Text = "LEVEL UP!",
		TextColor3 = CosmicUI.Colors.SolarGold,
		TextStrokeColor3 = Color3.fromRGB(100, 70, 0),
		TextStrokeTransparency = 0.1,
		TextSize = CosmicUI.fontSize("Hero"),
		BackgroundTransparency = 1,
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, 0.4, 0),
		Size = UDim2.new(0, 500, 0, 90),
		ZIndex = 42,
		TextTransparency = 0,
		Parent = container,
	})

	-- Animated gradient on title (Gold -> White -> Gold, looping)
	local titleGradient = CosmicUI.create("UIGradient", {
		Color = ColorSequence.new({
			ColorSequenceKeypoint.new(0, CosmicUI.Colors.SolarGold),
			ColorSequenceKeypoint.new(0.5, CosmicUI.Colors.PulsarWhite),
			ColorSequenceKeypoint.new(1, CosmicUI.Colors.SolarGold),
		}),
		Offset = Vector2.new(-1, 0),
		Parent = titleLabel,
	})

	-- UIScale for spring animation
	local titleScale = CosmicUI.create("UIScale", {
		Scale = 0,
		Parent = titleLabel,
	})

	task.delay(0.15, function()
		CosmicUI.spring(titleScale, { Scale = 1 }, "Elastic")

		-- Loop the gradient shimmer
		local gradientTween = TweenService:Create(titleGradient,
			TweenInfo.new(1.5, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1),
			{ Offset = Vector2.new(1, 0) }
		)
		gradientTween:Play()

		-- Store for cleanup
		task.delay(2.8, function()
			gradientTween:Cancel()
		end)
	end)

	-- 0.30s — Level number bounces in
	local levelLabel = CosmicUI.create("TextLabel", {
		Name = "LevelNumber",
		Font = FONT_FREDOKA,
		Text = "Level " .. tostring(newLevel),
		TextColor3 = CosmicUI.Colors.PulsarWhite,
		TextStrokeColor3 = CosmicUI.Colors.Stardust,
		TextStrokeTransparency = 0.4,
		TextSize = CosmicUI.fontSize("Title"),
		BackgroundTransparency = 1,
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, 0.5, 0),
		Size = UDim2.new(0, 300, 0, 50),
		ZIndex = 42,
		Parent = container,
	})

	local levelScale = CosmicUI.create("UIScale", {
		Scale = 0,
		Parent = levelLabel,
	})

	task.delay(0.30, function()
		CosmicUI.spring(levelScale, { Scale = 1 }, "Bouncy")
	end)

	-- 0.40s — Star particles burst outward
	task.delay(0.40, function()
		local particleColors = {
			CosmicUI.Colors.SolarGold,
			CosmicUI.Colors.PulsarWhite,
			CosmicUI.Colors.CosmicBlue,
		}
		local particleCount = RNG:NextInteger(20, 30)

		for i = 1, particleCount do
			local size = RNG:NextInteger(4, 12)
			local particle = CosmicUI.create("Frame", {
				Name = "StarParticle",
				Size = UDim2.new(0, size, 0, size),
				AnchorPoint = Vector2.new(0.5, 0.5),
				Position = UDim2.new(0.5, 0, 0.45, 0),
				BackgroundColor3 = particleColors[RNG:NextInteger(1, #particleColors)],
				Rotation = RNG:NextNumber(0, 360),
				ZIndex = 42,
				Parent = container,
			})
			CosmicUI.create("UICorner", {
				CornerRadius = UDim.new(0, 3),
				Parent = particle,
			})

			local angle = RNG:NextNumber(0, math.pi * 2)
			local dist = RNG:NextNumber(150, 400)
			local targetX = 0.5 + math.cos(angle) * dist / 1000
			local targetY = 0.45 + math.sin(angle) * dist / 1000
			local dur = RNG:NextNumber(0.8, 1.5)

			TweenService:Create(particle, TweenInfo.new(dur, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
				Position = UDim2.new(targetX, 0, targetY, 0),
				BackgroundTransparency = 1,
				Rotation = RNG:NextNumber(-180, 180),
				Size = UDim2.new(0, 2, 0, 2),
			}):Play()
		end
	end)

	-- 0.50s — Unlock preview (optional)
	if unlockInfo and unlockInfo ~= "" then
		task.delay(0.50, function()
			local unlockLabel = CosmicUI.create("TextLabel", {
				Name = "UnlockPreview",
				Font = FONT_FREDOKA,
				Text = unlockInfo,
				TextColor3 = CosmicUI.Colors.PlasmaGreen,
				TextStrokeColor3 = CosmicUI.Colors.Void,
				TextStrokeTransparency = 0.3,
				TextSize = CosmicUI.fontSize("Body"),
				BackgroundTransparency = 1,
				AnchorPoint = Vector2.new(0.5, 0.5),
				Position = UDim2.new(0.5, 0, 0.58, 0),
				Size = UDim2.new(0, 400, 0, 40),
				ZIndex = 42,
				Parent = container,
			})

			local unlockScale = CosmicUI.create("UIScale", {
				Scale = 0,
				Parent = unlockLabel,
			})
			CosmicUI.spring(unlockScale, { Scale = 1 }, "Gentle")
		end)
	end

	-- 2.50s — Fade everything out
	task.delay(2.50, function()
		local fadeInfo = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		TweenService:Create(overlay, fadeInfo, { BackgroundTransparency = 1 }):Play()
		TweenService:Create(titleLabel, fadeInfo, { TextTransparency = 1, TextStrokeTransparency = 1 }):Play()
		TweenService:Create(levelLabel, fadeInfo, { TextTransparency = 1, TextStrokeTransparency = 1 }):Play()

		-- 3.00s — Cleanup
		task.delay(0.5, function()
			container:Destroy()
		end)
	end)
end

-----------------------------------------------------------------------
-- 5. INFO TOAST (Top-Center)
-----------------------------------------------------------------------
local activeToasts = {}

local function showToast(text: string, color: Color3?)
	if not text then return end
	color = color or CosmicUI.Colors.CosmicBlue

	-- Limit to max 3
	while #activeToasts >= MAX_INFO_TOASTS do
		local oldest = table.remove(activeToasts, 1)
		if oldest and oldest.Parent then
			oldest:Destroy()
		end
	end

	local toast = CosmicUI.pill({
		name = "InfoToast",
		size = UDim2.new(1, 0, 0, 44),
		position = UDim2.new(0.5, 0, 0, -50), -- start above screen
		anchorPoint = Vector2.new(0.5, 0),
		color = CosmicUI.Colors.DeepSpace,
		transparency = 0.08,
		strokeColor = color,
		parent = toastLayer,
	})

	-- Icon circle (left, color-coded)
	local icon = CosmicUI.create("Frame", {
		Name = "Icon",
		Size = UDim2.new(0, 22, 0, 22),
		AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.new(0, 12, 0.5, 0),
		BackgroundColor3 = color,
		Parent = toast,
	})
	CosmicUI.create("UICorner", {
		CornerRadius = UDim.new(0.5, 0),
		Parent = icon,
	})

	-- Inner dot
	local dot = CosmicUI.create("Frame", {
		Name = "Dot",
		Size = UDim2.new(0, 8, 0, 8),
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, 0.5, 0),
		BackgroundColor3 = CosmicUI.Colors.PulsarWhite,
		Parent = icon,
	})
	CosmicUI.create("UICorner", {
		CornerRadius = UDim.new(0.5, 0),
		Parent = dot,
	})

	-- Text
	CosmicUI.create("TextLabel", {
		Name = "ToastText",
		Font = FONT_FREDOKA,
		Text = text,
		TextColor3 = CosmicUI.Colors.PulsarWhite,
		TextSize = CosmicUI.fontSize("Body"),
		TextXAlignment = Enum.TextXAlignment.Left,
		BackgroundTransparency = 1,
		Size = UDim2.new(1, -50, 1, 0),
		Position = UDim2.new(0, 42, 0, 0),
		TextTruncate = Enum.TextTruncate.AtEnd,
		Parent = toast,
	})

	-- Push existing toasts down
	for i, existing in ipairs(activeToasts) do
		if existing and existing.Parent then
			local targetY = (#activeToasts - i + 1) * 52
			CosmicUI.spring(existing, {
				Position = UDim2.new(0.5, 0, 0, targetY),
			}, "Gentle")
		end
	end

	table.insert(activeToasts, toast)

	-- Slide in from top with spring Gentle
	CosmicUI.spring(toast, {
		Position = UDim2.new(0.5, 0, 0, 0),
	}, "Gentle")

	-- Auto dismiss
	task.delay(INFO_DISMISS_TIME, function()
		CosmicUI.slideOut(toast, "up", function()
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
-- 6. SCREEN EFFECTS
-----------------------------------------------------------------------
function screenFlash(color: Color3?, duration: number?)
	color = color or Color3.new(1, 1, 1)
	duration = duration or 0.25

	flashFrame.BackgroundColor3 = color
	flashFrame.BackgroundTransparency = 0.4

	TweenService:Create(flashFrame, TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
		BackgroundTransparency = 1,
	}):Play()
end

local shaking = false
local shakeOffset = CFrame.new()

function screenShake(intensity: number?, duration: number?)
	intensity = intensity or 5
	duration = duration or 0.3

	if shaking then return end
	shaking = true

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
			RNG:NextNumber(-mag, mag),
			RNG:NextNumber(-mag, mag),
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
-- REMOTE EVENT CONNECTIONS
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
	levelUpEvent.OnClientEvent:Connect(function(newLevel, unlockInfo)
		if newLevel and type(newLevel) == "number" then
			showLevelUp(newLevel, unlockInfo)
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
-- EXPOSED API
-----------------------------------------------------------------------
_G.NotificationAPI = {
	showCoinGain = showCoinGain,
	showMaterialPickup = showMaterialPickup,
	showLevelUp = showLevelUp,
	showToast = showToast,
	showDamageNumber = showDamageNumber,
	screenFlash = screenFlash,
	screenShake = screenShake,
}

-----------------------------------------------------------------------
-- INIT
-----------------------------------------------------------------------
print("[NotificationClient] Cosmic Glass notification system loaded")
