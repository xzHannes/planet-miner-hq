--[[
    CosmicUI — Planet Miner Design System

    Central UI module for the "Cosmic Glass" aesthetic.
    All UI elements should use this module for consistent styling,
    responsive scaling, and spring-based animations.

    Usage:
        local CosmicUI = require(path.to.CosmicUI)
        local panel = CosmicUI.panel({ name = "MyPanel", size = UDim2.fromScale(0.3, 0.4), parent = screenGui })
        CosmicUI.bounceIn(panel, UDim2.new(0, 0, 0.1, 0))
]]

local RunService = game:GetService("RunService")

local CosmicUI = {}

--------------------------------------------------------------------------------
-- 1. DESIGN TOKENS
--------------------------------------------------------------------------------

-- Space Dark Spectrum (backgrounds)
-- Accent Colors (highlights, interactions)
-- Feedback Colors (status messages)
CosmicUI.Colors = {
    -- Backgrounds
    Void         = Color3.fromRGB(8, 8, 26),
    DeepSpace    = Color3.fromRGB(13, 14, 30),
    NebulaDark   = Color3.fromRGB(22, 26, 50),
    NebulaLight  = Color3.fromRGB(30, 36, 64),
    -- Accents
    CosmicBlue   = Color3.fromRGB(61, 170, 255),
    Stardust     = Color3.fromRGB(120, 90, 230),
    SolarGold    = Color3.fromRGB(255, 207, 51),
    PlasmaGreen  = Color3.fromRGB(80, 210, 130),
    NebulaCyan   = Color3.fromRGB(60, 200, 255),
    -- Feedback
    SupernovaRed = Color3.fromRGB(232, 80, 64),
    CometOrange  = Color3.fromRGB(255, 149, 51),
    PulsarWhite  = Color3.fromRGB(240, 240, 255),
    DustGrey     = Color3.fromRGB(160, 165, 190),
}

-- Rarity glow colors for item borders
CosmicUI.Rarity = {
    Common    = Color3.fromRGB(176, 184, 200),
    Uncommon  = Color3.fromRGB(80, 210, 130),
    Rare      = Color3.fromRGB(61, 170, 255),
    Epic      = Color3.fromRGB(120, 90, 230),
    Legendary = Color3.fromRGB(255, 207, 51),
    Mythic    = Color3.fromRGB(255, 68, 102),
}

CosmicUI.Radius = {
    Small  = UDim.new(0, 8),
    Normal = UDim.new(0, 12),
    Large  = UDim.new(0, 20),
}

CosmicUI.Stroke = {
    Thin   = 1,
    Normal = 1.5,
    Bold   = 2.5,
}

-- Font sizes as fraction of viewport height
CosmicUI.FontSizes = {
    Hero    = 0.045,
    Title   = 0.032,
    Body    = 0.022,
    Caption = 0.016,
    Micro   = 0.012,
}

--------------------------------------------------------------------------------
-- 2. RESPONSIVE SCALING
--------------------------------------------------------------------------------

local camera = workspace.CurrentCamera

-- Returns pixel value scaled to viewport.
-- baseUnit = min(viewportX, viewportY) / 100
-- So 1 unit ≈ 1% of the smaller viewport dimension.
function CosmicUI.scale(units: number): number
    local viewport = camera.ViewportSize
    local baseUnit = math.min(viewport.X, viewport.Y) / 100
    return math.round(baseUnit * units)
end

-- Returns pixel font size from a FontSizes key, based on viewport height.
function CosmicUI.fontSize(sizeKey: string): number
    local fraction = CosmicUI.FontSizes[sizeKey]
    if not fraction then
        warn("[CosmicUI] Unknown font size key: " .. tostring(sizeKey))
        fraction = CosmicUI.FontSizes.Body
    end
    local viewport = camera.ViewportSize
    return math.round(viewport.Y * fraction)
end

--------------------------------------------------------------------------------
-- 3. SPRING TWEEN SYSTEM
--------------------------------------------------------------------------------

--[[
    Damped spring physics running on RunService.Heartbeat.

    Spring equation (per-frame):
        acceleration = -freq² * (x - target) - 2 * damping * freq * velocity
        velocity += acceleration * dt
        x += velocity * dt

    Settles when |velocity| < threshold and |x - target| < threshold.
    This gives organic, bouncy motion that TweenService cannot replicate.
]]

CosmicUI.SpringPresets = {
    Snappy  = { frequency = 8,  damping = 0.8 },   -- Buttons, quick snaps (~0.15s)
    Bouncy  = { frequency = 5,  damping = 0.5 },   -- Panel entrances (~0.4s)
    Elastic = { frequency = 3,  damping = 0.3 },   -- Level-up celebrations (~0.6s)
    Gentle  = { frequency = 4,  damping = 0.9 },   -- Tooltips, subtle (~0.3s)
}

-- Threshold for considering the spring settled
local SETTLE_THRESHOLD = 0.001

-- Internal: animate a single numeric value with spring physics.
-- Returns current, velocity each frame; calls onUpdate with new value.
local function springStep(current: number, velocity: number, target: number, freq: number, damp: number, dt: number): (number, number)
    local displacement = current - target
    local springForce = -freq * freq * displacement
    local dampingForce = -2 * damp * freq * velocity
    local acceleration = springForce + dampingForce
    velocity = velocity + acceleration * dt
    current = current + velocity * dt
    return current, velocity
end

local function isSettled(current: number, velocity: number, target: number): boolean
    return math.abs(velocity) < SETTLE_THRESHOLD and math.abs(current - target) < SETTLE_THRESHOLD
end

-- Decompose a UDim2 into 4 numbers: XScale, XOffset, YScale, YOffset
local function udim2ToComponents(u: UDim2): (number, number, number, number)
    return u.X.Scale, u.X.Offset, u.Y.Scale, u.Y.Offset
end

local function componentsToUDim2(xs: number, xo: number, ys: number, yo: number): UDim2
    return UDim2.new(xs, math.round(xo), ys, math.round(yo))
end

--[[
    CosmicUI.spring(instance, targetProps, presetOrConfig, callback)

    Animates instance properties using damped spring physics.

    Parameters:
        instance       — The GUI instance to animate
        targetProps    — Table of property names → target values
                         Supports: number props (Transparency, Rotation, etc.) and UDim2 (Position, Size)
        presetOrConfig — String key into SpringPresets ("Snappy") or {frequency, damping} table
        callback       — Optional function called when all springs have settled

    Returns:
        cancel()       — Call to stop the animation immediately
]]
function CosmicUI.spring(instance: Instance, targetProps: {[string]: any}, presetOrConfig: any, callback: (() -> ())?): () -> ()
    local config
    if type(presetOrConfig) == "string" then
        config = CosmicUI.SpringPresets[presetOrConfig]
        if not config then
            warn("[CosmicUI] Unknown spring preset: " .. presetOrConfig .. ", falling back to Snappy")
            config = CosmicUI.SpringPresets.Snappy
        end
    else
        config = presetOrConfig
    end

    local freq = config.frequency
    local damp = config.damping

    -- Build spring state for each property
    -- Each entry: { current: {number}, velocity: {number}, target: {number}, propName: string, isUDim2: boolean }
    local springs = {}

    for propName, targetValue in pairs(targetProps) do
        local currentValue = instance[propName]

        if typeof(targetValue) == "UDim2" then
            local cxs, cxo, cys, cyo = udim2ToComponents(currentValue)
            local txs, txo, tys, tyo = udim2ToComponents(targetValue)
            table.insert(springs, {
                propName = propName,
                isUDim2 = true,
                current = { cxs, cxo, cys, cyo },
                velocity = { 0, 0, 0, 0 },
                target = { txs, txo, tys, tyo },
            })
        elseif type(targetValue) == "number" then
            table.insert(springs, {
                propName = propName,
                isUDim2 = false,
                current = { currentValue },
                velocity = { 0 },
                target = { targetValue },
            })
        else
            warn("[CosmicUI] spring: unsupported property type for " .. propName)
        end
    end

    local cancelled = false
    local connection: RBXScriptConnection

    connection = RunService.Heartbeat:Connect(function(dt: number)
        if cancelled then
            connection:Disconnect()
            return
        end

        -- Cap dt to prevent spiral-of-death on lag spikes
        dt = math.min(dt, 0.05)

        local allSettled = true

        for _, sp in ipairs(springs) do
            local settled = true
            for i = 1, #sp.current do
                sp.current[i], sp.velocity[i] = springStep(
                    sp.current[i], sp.velocity[i], sp.target[i], freq, damp, dt
                )
                if not isSettled(sp.current[i], sp.velocity[i], sp.target[i]) then
                    settled = false
                end
            end

            -- Apply to instance
            if sp.isUDim2 then
                instance[sp.propName] = componentsToUDim2(
                    sp.current[1], sp.current[2], sp.current[3], sp.current[4]
                )
            else
                instance[sp.propName] = sp.current[1]
            end

            if not settled then
                allSettled = false
            end
        end

        if allSettled then
            -- Snap to exact target values
            for _, sp in ipairs(springs) do
                if sp.isUDim2 then
                    instance[sp.propName] = componentsToUDim2(
                        sp.target[1], sp.target[2], sp.target[3], sp.target[4]
                    )
                else
                    instance[sp.propName] = sp.target[1]
                end
            end
            connection:Disconnect()
            if callback then
                callback()
            end
        end
    end)

    return function()
        cancelled = true
    end
end

--------------------------------------------------------------------------------
-- 4. UTILITY FUNCTIONS
--------------------------------------------------------------------------------

-- Instance factory: create(className, properties, children)
-- Mirrors the pattern used in existing HudClient code.
function CosmicUI.create(className: string, props: {[string]: any}?, children: {Instance}?): Instance
    local inst = Instance.new(className)
    if props then
        for key, value in pairs(props) do
            if key == "Parent" then continue end -- set parent last
            inst[key] = value
        end
        if props.Parent then
            inst.Parent = props.Parent
        end
    end
    if children then
        for _, child in ipairs(children) do
            child.Parent = inst
        end
    end
    return inst
end

-- Add a glow ImageLabel behind the parent element
function CosmicUI.addGlow(parent: GuiObject, color: Color3?, transparency: number?): ImageLabel
    local glowColor = color or CosmicUI.Colors.CosmicBlue
    local glowTransparency = transparency or 0.85

    return CosmicUI.create("ImageLabel", {
        Name = "Glow",
        Image = "rbxassetid://6014261993", -- radial gradient circle
        ImageColor3 = glowColor,
        ImageTransparency = glowTransparency,
        BackgroundTransparency = 1,
        Size = UDim2.new(1.4, 0, 1.4, 0),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        ZIndex = -1,
        Parent = parent,
    }) :: ImageLabel
end

-- Add a UIStroke to a parent element
function CosmicUI.addStroke(parent: GuiObject, color: Color3?, thickness: number?, transparency: number?): UIStroke
    return CosmicUI.create("UIStroke", {
        Color = color or CosmicUI.Colors.CosmicBlue,
        Thickness = thickness or CosmicUI.Stroke.Normal,
        Transparency = transparency or 0.5,
        ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
        Parent = parent,
    }) :: UIStroke
end

-- Format large numbers: 1000→"1K", 1500→"1.5K", 1000000→"1M", etc.
function CosmicUI.formatNumber(n: number): string
    if n >= 1e9 then
        local val = n / 1e9
        return string.format(val == math.floor(val) and "%dB" or "%.1fB", val)
    elseif n >= 1e6 then
        local val = n / 1e6
        return string.format(val == math.floor(val) and "%dM" or "%.1fM", val)
    elseif n >= 1e3 then
        local val = n / 1e3
        return string.format(val == math.floor(val) and "%dK" or "%.1fK", val)
    else
        return tostring(math.floor(n))
    end
end

--------------------------------------------------------------------------------
-- 5. PANEL FACTORY
--------------------------------------------------------------------------------

--[[
    CosmicUI.panel(props) — Create a Cosmic Glass panel

    props: {
        name: string?,          — Instance name (default "CosmicPanel")
        position: UDim2?,       — Panel position
        size: UDim2?,           — Panel size
        anchorPoint: Vector2?,  — Anchor point
        strokeColor: Color3?,   — Stroke color (default CosmicBlue)
        radius: UDim?,          — Corner radius (default Normal = 12px)
        transparency: number?,  — Background transparency (default 0.15)
        glow: boolean?,         — Add glow underneath (default false)
        glowColor: Color3?,     — Glow color (default strokeColor or CosmicBlue)
        parent: Instance?,      — Parent instance
    }

    Returns: Frame (the panel)
]]
function CosmicUI.panel(props: {[string]: any}?): Frame
    props = props or {}

    local strokeColor = props.strokeColor or CosmicUI.Colors.CosmicBlue
    local radius = props.radius or CosmicUI.Radius.Normal
    local bgTransparency = props.transparency or 0.15

    local frame = CosmicUI.create("Frame", {
        Name = props.name or "CosmicPanel",
        Position = props.position or UDim2.new(0, 0, 0, 0),
        Size = props.size or UDim2.new(0, 200, 0, 100),
        AnchorPoint = props.anchorPoint or Vector2.new(0, 0),
        BackgroundColor3 = CosmicUI.Colors.DeepSpace,
        BackgroundTransparency = bgTransparency,
        BorderSizePixel = 0,
    })

    -- Corner radius
    CosmicUI.create("UICorner", {
        CornerRadius = radius,
        Parent = frame,
    })

    -- Subtle gradient: DeepSpace → NebulaDark, 135° rotation
    CosmicUI.create("UIGradient", {
        Color = ColorSequence.new(CosmicUI.Colors.DeepSpace, CosmicUI.Colors.NebulaDark),
        Rotation = 135,
        Parent = frame,
    })

    -- Stroke border
    CosmicUI.addStroke(frame, strokeColor, CosmicUI.Stroke.Normal, 0.5)

    -- Optional glow
    if props.glow then
        CosmicUI.addGlow(frame, props.glowColor or strokeColor, 0.85)
    end

    -- Set parent last
    if props.parent then
        frame.Parent = props.parent
    end

    return frame
end

--------------------------------------------------------------------------------
-- 6. PILL & ICON BUTTON
--------------------------------------------------------------------------------

-- Pill-shaped frame (full rounded corners via CornerRadius = 1, 0)
function CosmicUI.pill(props: {[string]: any}?): Frame
    props = props or {}

    local frame = CosmicUI.create("Frame", {
        Name = props.name or "Pill",
        Position = props.position or UDim2.new(0, 0, 0, 0),
        Size = props.size or UDim2.new(0, 100, 0, 32),
        AnchorPoint = props.anchorPoint or Vector2.new(0, 0),
        BackgroundColor3 = props.color or CosmicUI.Colors.DeepSpace,
        BackgroundTransparency = props.transparency or 0.15,
        BorderSizePixel = 0,
    })

    CosmicUI.create("UICorner", {
        CornerRadius = UDim.new(0.5, 0), -- full pill shape
        Parent = frame,
    })

    if props.strokeColor then
        CosmicUI.addStroke(frame, props.strokeColor, CosmicUI.Stroke.Thin, 0.5)
    end

    if props.parent then
        frame.Parent = props.parent
    end

    return frame
end

-- Cosmic glass icon button with hover/press spring states
-- props: { icon, color, position, size, onClick, parent, name }
function CosmicUI.iconButton(props: {[string]: any}): TextButton
    props = props or {}

    local btnSize = props.size or UDim2.new(0, 48, 0, 48)
    local btnColor = props.color or CosmicUI.Colors.CosmicBlue

    local btn = CosmicUI.create("TextButton", {
        Name = props.name or "IconButton",
        Position = props.position or UDim2.new(0, 0, 0, 0),
        Size = btnSize,
        AnchorPoint = props.anchorPoint or Vector2.new(0, 0),
        BackgroundColor3 = CosmicUI.Colors.DeepSpace,
        BackgroundTransparency = 0.15,
        BorderSizePixel = 0,
        Text = "",
        AutoButtonColor = false,
    })

    CosmicUI.create("UICorner", {
        CornerRadius = CosmicUI.Radius.Normal,
        Parent = btn,
    })

    local stroke = CosmicUI.addStroke(btn, btnColor, CosmicUI.Stroke.Thin, 0.5)

    -- Icon image inside the button
    if props.icon then
        CosmicUI.create("ImageLabel", {
            Name = "Icon",
            Image = props.icon,
            ImageColor3 = btnColor,
            BackgroundTransparency = 1,
            Size = UDim2.new(0.6, 0, 0.6, 0),
            Position = UDim2.new(0.5, 0, 0.5, 0),
            AnchorPoint = Vector2.new(0.5, 0.5),
            Parent = btn,
        })
    end

    -- Hover: brighten stroke, scale up slightly
    local originalSize = btnSize
    local cancelHover = nil

    btn.MouseEnter:Connect(function()
        stroke.Transparency = 0.2
        if cancelHover then cancelHover() end
        cancelHover = CosmicUI.spring(btn, {
            Size = UDim2.new(
                originalSize.X.Scale * 1.08, math.round(originalSize.X.Offset * 1.08),
                originalSize.Y.Scale * 1.08, math.round(originalSize.Y.Offset * 1.08)
            ),
        }, "Snappy")
    end)

    btn.MouseLeave:Connect(function()
        stroke.Transparency = 0.5
        if cancelHover then cancelHover() end
        cancelHover = CosmicUI.spring(btn, { Size = originalSize }, "Snappy")
    end)

    -- Press: quick scale down
    btn.MouseButton1Down:Connect(function()
        if cancelHover then cancelHover() end
        cancelHover = CosmicUI.spring(btn, {
            Size = UDim2.new(
                originalSize.X.Scale * 0.92, math.round(originalSize.X.Offset * 0.92),
                originalSize.Y.Scale * 0.92, math.round(originalSize.Y.Offset * 0.92)
            ),
        }, "Snappy")
    end)

    btn.MouseButton1Up:Connect(function()
        if cancelHover then cancelHover() end
        cancelHover = CosmicUI.spring(btn, { Size = originalSize }, "Snappy")
    end)

    -- Click callback
    if props.onClick then
        btn.MouseButton1Click:Connect(props.onClick)
    end

    if props.parent then
        btn.Parent = props.parent
    end

    return btn
end

--------------------------------------------------------------------------------
-- 7. ANIMATION HELPERS
--------------------------------------------------------------------------------

-- Panel slides in from an offset with spring Bouncy + opacity fade
-- fromOffset: UDim2 starting offset (e.g. UDim2.new(-0.1, 0, 0, 0) for left slide-in)
-- delay: seconds to wait before starting (optional)
function CosmicUI.bounceIn(inst: GuiObject, fromOffset: UDim2?, delayTime: number?)
    local offset = fromOffset or UDim2.new(0, 0, 0.1, 0)
    local targetPos = inst.Position

    -- Start from offset position and fully transparent
    inst.Position = UDim2.new(
        targetPos.X.Scale + offset.X.Scale, targetPos.X.Offset + offset.X.Offset,
        targetPos.Y.Scale + offset.Y.Scale, targetPos.Y.Offset + offset.Y.Offset
    )
    inst.BackgroundTransparency = 1

    local function animate()
        CosmicUI.spring(inst, { Position = targetPos, BackgroundTransparency = 0.15 }, "Bouncy")
    end

    if delayTime and delayTime > 0 then
        task.delay(delayTime, animate)
    else
        animate()
    end
end

-- Quick exit slide: fast, no bounce, high-damping spring
-- direction: "left", "right", "up", "down" (default "down")
function CosmicUI.slideOut(inst: GuiObject, direction: string?, callback: (() -> ())?)
    local dir = direction or "down"
    local offsets = {
        left  = UDim2.new(-0.15, 0, 0, 0),
        right = UDim2.new(0.15, 0, 0, 0),
        up    = UDim2.new(0, 0, -0.15, 0),
        down  = UDim2.new(0, 0, 0.15, 0),
    }
    local offset = offsets[dir] or offsets.down
    local targetPos = UDim2.new(
        inst.Position.X.Scale + offset.X.Scale, inst.Position.X.Offset + offset.X.Offset,
        inst.Position.Y.Scale + offset.Y.Scale, inst.Position.Y.Offset + offset.Y.Offset
    )

    -- High-damping, high-freq spring = quick exit, no bounce
    CosmicUI.spring(inst, {
        Position = targetPos,
        BackgroundTransparency = 1,
    }, { frequency = 10, damping = 1.0 }, callback)
end

-- Pop in: scale from 0.7 to 1.0 with Elastic spring + opacity fade
function CosmicUI.popIn(inst: GuiObject, callback: (() -> ())?)
    local targetSize = inst.Size
    -- Start at 70% scale
    inst.Size = UDim2.new(
        targetSize.X.Scale * 0.7, math.round(targetSize.X.Offset * 0.7),
        targetSize.Y.Scale * 0.7, math.round(targetSize.Y.Offset * 0.7)
    )
    inst.BackgroundTransparency = 1

    CosmicUI.spring(inst, {
        Size = targetSize,
        BackgroundTransparency = 0.15,
    }, "Elastic", callback)
end

-- Pop out: scale to 0.9 + fade, quick (no bounce)
function CosmicUI.popOut(inst: GuiObject, callback: (() -> ())?)
    local currentSize = inst.Size
    local shrunkSize = UDim2.new(
        currentSize.X.Scale * 0.9, math.round(currentSize.X.Offset * 0.9),
        currentSize.Y.Scale * 0.9, math.round(currentSize.Y.Offset * 0.9)
    )

    CosmicUI.spring(inst, {
        Size = shrunkSize,
        BackgroundTransparency = 1,
    }, { frequency = 10, damping = 1.0 }, callback)
end

--------------------------------------------------------------------------------

return CosmicUI
