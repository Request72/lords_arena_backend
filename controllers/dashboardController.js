const Player = require('../models/Player');

function calculateRank(kills, kdRatio) {
    if (kills >= 500 && kdRatio >= 4.0) return 'Legend';
    if (kills >= 300 && kdRatio >= 2.5) return 'Elite';
    if (kills >= 150 && kdRatio >= 1.5) return 'Veteran';
    if (kills >= 50 && kdRatio >= 1.0) return 'Soldier';
    return 'Rookie';
}

exports.getDashboard = async(req, res) => {
    try {
        const player = await Player.findOne({ userId: req.user._id });

        if (!player) return res.status(404).json({ error: 'Player not found' });

        const kdRatioRaw = player.deaths > 0 ? player.kills / player.deaths : player.kills;
        const kdRatio = kdRatioRaw.toFixed(2);
        const rank = calculateRank(player.kills, kdRatioRaw);

        res.json({
            nickname: player.nickname,
            avatar: player.avatar,
            kills: player.kills,
            deaths: player.deaths,
            matchesPlayed: player.matchesPlayed,
            kdRatio,
            rank
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};