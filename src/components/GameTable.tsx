import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardUI from './CardUI';
import '../index.css';
import { Card, Suit } from '../game-engine/card';
import { Validator, ComboType } from '../game-engine/validator';
import { BotAI } from '../game-engine/bot';
import { socket, authenticateSocket, getUserId } from '../socket';
import { GameEffects, type ComboEffectData } from './GameEffects';

const GameTable: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const isOfflineMode = !roomId || roomId === 'offline';
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string>('');
  const userIdRef = useRef<string>('');
  const [username, setUsername] = useState<string>('Guest');

  // Trạng thái chung
  const [hands, setHands] = useState<{ [key: number]: Card[] }>({ 0: [], 1: [], 2: [], 3: [] });
  const [playersInfo, setPlayersInfo] = useState<any[]>([]);
  const [ranks, setRanks] = useState<{ [key: number]: number }>({});
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [centerCards, setCenterCards] = useState<Card[]>([]);
  
  const [turn, setTurn] = useState<number>(-1);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [lastPlayedTurn, setLastPlayedTurn] = useState<number>(0);
  const [messages, setMessages] = useState<{ [key: number]: string }>({});
  const [passedPlayers, setPassedPlayers] = useState<number[]>([]);
  
  const [isFirstGame, setIsFirstGame] = useState<boolean>(true);
  const [isFirstMove, setIsFirstMove] = useState<boolean>(true);
  const [penaltyResults, setPenaltyResults] = useState<any[]>([]);

  // Visual Effects State
  const [activeEffect, setActiveEffect] = useState<ComboEffectData | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const prevCenterCardsRef = useRef<Card[]>([]);

  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
  };

  // Combo effect detector
  useEffect(() => {
    if (centerCards.length === 0) {
      prevCenterCardsRef.current = [];
      return;
    }

    const prevCards = prevCenterCardsRef.current;
    if (prevCards.length > 0) {
      const prevCombo = Validator.getCombo(prevCards);
      const currCombo = Validator.getCombo(centerCards);

      if (currCombo.type !== ComboType.INVALID) {
        const isPrevPig = (prevCombo.type === ComboType.SINGLE || prevCombo.type === ComboType.PAIR) && prevCombo.highestCard.value === 15;
        const isPrev3Pairs = prevCombo.type === ComboType.THREE_PAIRS;
        const isPrevFourOfKind = prevCombo.type === ComboType.FOUR_OF_KIND;

        const isChopCombo = currCombo.type === ComboType.THREE_PAIRS || currCombo.type === ComboType.FOUR_OF_KIND || currCombo.type === ComboType.FOUR_PAIRS || currCombo.type === ComboType.DRAGON_STRAIGHT;

        if ((isPrevPig || isPrev3Pairs || isPrevFourOfKind) && isChopCombo && Validator.canPlay(currCombo, prevCombo)) {
          let title = '💥 CHẶT HEO! 💥';
          if (isPrev3Pairs) title = '⚡ CHẶT 3 ĐÔI THÔNG! ⚡';
          else if (isPrevFourOfKind) title = '💣 CHẶT TỨ QUÝ! 💣';
          else if (prevCombo.type === ComboType.PAIR) title = '🔥 CHẶT ĐÔI HEO! 🔥';

          setActiveEffect({
            id: Date.now(),
            type: 'CHOP',
            title: title,
            subtext: 'CÚ ĐÁNH XUẤT SẮC!'
          });
          triggerScreenShake();
        } else if (currCombo.type === ComboType.FOUR_OF_KIND) {
          setActiveEffect({
            id: Date.now(),
            type: 'FOUR_OF_KIND',
            title: '🔥 TỨ QUÝ! 🔥',
            subtext: 'BỘ BÀI SIÊU MẠNH'
          });
        } else if (currCombo.type === ComboType.FOUR_PAIRS) {
          setActiveEffect({
            id: Date.now(),
            type: 'FOUR_PAIRS',
            title: '💣 4 ĐÔI THÔNG! 💣',
            subtext: 'CHẶT TỨ QUÝ & HEO MỌI LÚC'
          });
          triggerScreenShake();
        } else if (currCombo.type === ComboType.THREE_PAIRS) {
          setActiveEffect({
            id: Date.now(),
            type: 'THREE_PAIRS',
            title: '⚡ 3 ĐÔI THÔNG! ⚡',
            subtext: 'BÀI ĐẶC BIỆT'
          });
        } else if (currCombo.type === ComboType.DRAGON_STRAIGHT) {
          setActiveEffect({
            id: Date.now(),
            type: 'DRAGON_STRAIGHT',
            title: '🐉 SẢNH RỒNG! 🐉',
            subtext: 'BỘ BÀI BÁ VƯƠNG'
          });
          triggerScreenShake();
        } else if (currCombo.type === ComboType.STRAIGHT && currCombo.cards.length >= 4) {
          setActiveEffect({
            id: Date.now(),
            type: 'STRAIGHT',
            title: `✨ SẢNH ${currCombo.cards.length} LÁ! ✨`,
            subtext: 'CHUỖI BÀI ĐẸP'
          });
        } else if (currCombo.highestCard.value === 15 && (currCombo.type === ComboType.SINGLE || currCombo.type === ComboType.PAIR)) {
          setActiveEffect({
            id: Date.now(),
            type: 'HEO',
            title: currCombo.type === ComboType.PAIR ? '👑 ĐÔI HEO BÁ ĐẠO!' : '👑 HEO QUYỀN LỰC!',
            subtext: 'LÁ BÀI TỐI CAO'
          });
        }
      }
    } else {
      const currCombo = Validator.getCombo(centerCards);
      if (currCombo.type === ComboType.FOUR_OF_KIND) {
        setActiveEffect({
          id: Date.now(),
          type: 'FOUR_OF_KIND',
          title: '🔥 TỨ QUÝ! 🔥',
          subtext: 'BỘ BÀI SIÊU MẠNH'
        });
      } else if (currCombo.type === ComboType.FOUR_PAIRS) {
        setActiveEffect({
          id: Date.now(),
          type: 'FOUR_PAIRS',
          title: '💣 4 ĐÔI THÔNG! 💣',
          subtext: 'CHẶT TỨ QUÝ & HEO MỌI LÚC'
        });
      } else if (currCombo.type === ComboType.THREE_PAIRS) {
        setActiveEffect({
          id: Date.now(),
          type: 'THREE_PAIRS',
          title: '⚡ 3 ĐÔI THÔNG! ⚡',
          subtext: 'BÀI ĐẶC BIỆT'
        });
      } else if (currCombo.type === ComboType.DRAGON_STRAIGHT) {
        setActiveEffect({
          id: Date.now(),
          type: 'DRAGON_STRAIGHT',
          title: '🐉 SẢNH RỒNG! 🐉',
          subtext: 'BỘ BÀI BÁ VƯƠNG'
        });
      } else if (currCombo.type === ComboType.STRAIGHT && currCombo.cards.length >= 5) {
        setActiveEffect({
          id: Date.now(),
          type: 'STRAIGHT',
          title: `✨ SẢNH ${currCombo.cards.length} LÁ! ✨`,
          subtext: 'CHUỖI BÀI ĐẸP'
        });
      } else if (currCombo.highestCard.value === 15 && (currCombo.type === ComboType.SINGLE || currCombo.type === ComboType.PAIR)) {
        setActiveEffect({
          id: Date.now(),
          type: 'HEO',
          title: currCombo.type === ComboType.PAIR ? '👑 ĐÔI HEO BÁ ĐẠO!' : '👑 HEO QUYỀN LỰC!',
          subtext: 'LÁ BÀI TỐI CAO'
        });
      }
    }

    prevCenterCardsRef.current = centerCards;
  }, [centerCards]);

  // Room online state
  const [roomState, setRoomState] = useState<any>(null);

  // Authenticate socket user
  useEffect(() => {
    const user = authenticateSocket();
    setUserId(user.userId);
    userIdRef.current = user.userId;
    setUsername(user.username);
  }, []);

  // --- ONLINE SOCKET.IO LOGIC ---
  useEffect(() => {
    if (isOfflineMode) return;

    socket.emit('room:join', { roomId });

    const handleRoomUpdate = (data: any) => {
      setRoomState(data);
      if (data.players) {
        setPlayersInfo(data.players);
      }
    };

    const handleGameStarted = (data: any) => {
      setRoomState(data);
      updateStateFromPublicRoom(data);
      setIsDealing(true);
      setTimeout(() => {
        setIsDealing(false);
      }, 1500);
    };

    const handleGameUpdate = (data: any) => {
      setRoomState(data);
      updateStateFromPublicRoom(data);
    };

    const handleError = (msg: string) => {
      alert(`Lỗi: ${msg}`);
    };

    const handleRoomCancelled = (data: { roomId: string; reason?: string }) => {
      alert(data.reason || 'Bàn đã bị hủy!');
      navigate('/lobby');
    };

    socket.on('room:update', handleRoomUpdate);
    socket.on('game:started', handleGameStarted);
    socket.on('game:update', handleGameUpdate);
    socket.on('room:cancelled', handleRoomCancelled);
    socket.on('error', handleError);

    return () => {
      socket.off('room:update', handleRoomUpdate);
      socket.off('game:started', handleGameStarted);
      socket.off('game:update', handleGameUpdate);
      socket.off('room:cancelled', handleRoomCancelled);
      socket.off('error', handleError);
    };
  }, [roomId, isOfflineMode, navigate]);

  const updateStateFromPublicRoom = (data: any) => {
    if (!data || !data.players) return;

    const currentUserId = userIdRef.current || getUserId();
    const N = data.players.length;

    // Tìm index của tôi trong danh sách players (0..N-1)
    const myIdx = data.players.findIndex((p: any) => p.id === currentUserId);
    const myActualIdx = myIdx !== -1 ? myIdx : 0;

    // Sắp xếp danh sách N chỗ ngồi sao cho tôi luôn ở vị trí 0 (Dưới cùng)
    const rotatedPlayers: any[] = [];
    const rotatedHands: { [key: number]: Card[] } = {};

    for (let i = 0; i < N; i++) {
      const origIdx = (myActualIdx + i) % N;
      const player = data.players[origIdx];

      if (player) {
        rotatedPlayers.push({ ...player, origIdx });
        const rawCards = player.cards || [];
        rotatedHands[i] = rawCards.map((c: any) => new Card(c.value, c.suit));
      } else {
        rotatedPlayers.push({ id: `empty_${i}`, username: 'Chỗ trống', isBot: false, origIdx });
        rotatedHands[i] = [];
      }
    }

    setPlayersInfo(rotatedPlayers);
    setHands(rotatedHands);

    // Turn index quy đổi về vị trí xoay (0 = Tôi)
    const currentTurn = data.turnIndex;
    const rotatedTurn = currentTurn !== -1 ? (currentTurn - myActualIdx + N) % N : -1;
    setTurn(rotatedTurn);

    const rotatedLastTurn = (data.lastPlayedTurn - myActualIdx + N) % N;
    setLastPlayedTurn(rotatedLastTurn);

    const center = (data.centerCards || []).map((c: any) => new Card(c.value, c.suit));
    setCenterCards(center);

    const rotatedPassed = (data.passedPlayers || []).map((pIdx: number) => (pIdx - myActualIdx + N) % N);
    setPassedPlayers(rotatedPassed);

    const rotatedRanks: { [key: number]: number } = {};
    for (const pIdxStr in data.ranks) {
      const origPIdx = Number(pIdxStr);
      const rTurn = (origPIdx - myActualIdx + N) % N;
      rotatedRanks[rTurn] = data.ranks[origPIdx];
    }
    setRanks(rotatedRanks);

    if (data.penaltyResults) {
      const rotatedPenalties = data.penaltyResults.map((r: any) => {
        const rTurn = (r.player - myActualIdx + N) % N;
        return { ...r, player: rTurn };
      });
      setPenaltyResults(rotatedPenalties);
    }

    setIsFirstMove(!!data.isFirstMove);
  };

  // --- OFFLINE LOGIC ---
  const createDeck = () => {
    const deck: Card[] = [];
    for (let value = 3; value <= 15; value++) {
      for (let suit = 0; suit < 4; suit++) {
        deck.push(new Card(value, suit as Suit));
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const shuffleAndDealOffline = () => {
    setIsDealing(true);
    setTurn(-1);
    const deck = createDeck();
    const newHands = {
      0: Validator.sortCards(deck.slice(0, 13)),
      1: Validator.sortCards(deck.slice(13, 26)),
      2: Validator.sortCards(deck.slice(26, 39)),
      3: Validator.sortCards(deck.slice(39, 52))
    };
    setHands(newHands);
    setPlayersInfo([
      { id: 'me', username: username, isBot: false },
      { id: 'bot1', username: 'Player 2 (Bot)', isBot: true },
      { id: 'bot2', username: 'Player 3 (Bot)', isBot: true },
      { id: 'bot3', username: 'Player 4 (Bot)', isBot: true }
    ]);
    
    let startingPlayer = 0;
    if (isFirstGame) {
       setIsFirstMove(true);
       for (let i = 0; i < 4; i++) {
         if (newHands[i as keyof typeof newHands].some(c => c.value === 3 && c.suit === 0)) {
            startingPlayer = i;
            break;
         }
       }
    } else {
       setIsFirstMove(false);
       const winnerKey = Object.keys(ranks).find(k => ranks[Number(k)] === 1);
       startingPlayer = winnerKey !== undefined ? Number(winnerKey) : 0;
    }

    setRanks({});
    setPassedPlayers([]);
    setCenterCards([]);
    setSelectedIndexes([]);
    setMessages({});
    setPenaltyResults([]);
    
    setTimeout(() => {
      setIsDealing(false);
      setTurn(startingPlayer);
    }, 1500);
  };

  useEffect(() => {
    if (isOfflineMode) {
      shuffleAndDealOffline();
    }
  }, [isOfflineMode]);

  const playCardSound = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/impacts/wood_impact_hard.ogg');
    audio.volume = 0.5;
    audio.play().catch(e => console.log(e));
  };

  const isNewRound = centerCards.length === 0;
  const centerCombo = centerCards.length > 0 ? Validator.getCombo(centerCards) : null;
  const myCards = hands[0] || [];
  
  // Dùng Validator.getPlayableIndices chuẩn xác!
  const playableIndices = Validator.getPlayableIndices(myCards, isNewRound ? null : centerCombo, isFirstMove);

  useEffect(() => {
    if (turn === 0) {
      setSelectedIndexes(prev => prev.filter(idx => playableIndices.includes(idx)));
    }
  }, [turn, centerCards.length]);

  const toggleSelect = (idx: number) => {
    if (turn !== 0 || !playableIndices.includes(idx)) return;
    if (selectedIndexes.includes(idx)) {
      setSelectedIndexes(selectedIndexes.filter(i => i !== idx));
    } else {
      setSelectedIndexes([...selectedIndexes, idx]);
    }
  };

  const showMessage = (playerIdx: number, text: string) => {
    setMessages(prev => ({ ...prev, [playerIdx]: text }));
    setTimeout(() => {
      setMessages(prev => {
        const newMsg = { ...prev };
        delete newMsg[playerIdx];
        return newMsg;
      });
    }, 2000);
  };

  // Turn management for Offline Bot AI
  const advanceTurnOffline = (currentTurn: number, isPass: boolean, currentHandCount: number) => {
    const updatedRanks = { ...ranks };
    if (currentHandCount === 0 && !updatedRanks[currentTurn]) {
       const rank = Object.keys(updatedRanks).length + 1;
       updatedRanks[currentTurn] = rank;
       setRanks(updatedRanks);
       showMessage(currentTurn, `Về hạng ${rank}! 🏆`);
    }

    if (Object.keys(updatedRanks).length >= 3) {
       const loser = [0,1,2,3].find(p => !updatedRanks[p]);
       if (loser !== undefined) updatedRanks[loser] = 4;
       setRanks(updatedRanks);
       setIsFirstGame(false);
       setTurn(-1);
       return;
    }

    let updatedPassed = [...passedPlayers];
    if (isPass) updatedPassed.push(currentTurn);

    const currentActiveCount = 4 - Object.keys(updatedRanks).length;
    const isRoundOver = updatedPassed.length >= currentActiveCount - 1;

    let nextTurn = (currentTurn + 3) % 4;
    if (isRoundOver) {
       updatedPassed = [];
       setCenterCards([]);
       nextTurn = isPass ? lastPlayedTurn : currentTurn;
       let skip = 0;
       while (updatedRanks[nextTurn] && skip < 4) {
          nextTurn = (nextTurn + 3) % 4;
          skip++;
       }
    } else {
       let skipCount = 0;
       while ((updatedRanks[nextTurn] || updatedPassed.includes(nextTurn)) && skipCount < 4) {
          nextTurn = (nextTurn + 3) % 4;
          skipCount++;
       }
    }

    setPassedPlayers(updatedPassed);
    setTurn(nextTurn);
  };

  // Offline bot turn execution
  useEffect(() => {
    if (isOfflineMode && turn > 0 && hands[turn as keyof typeof hands]?.length > 0) {
      const timer = setTimeout(() => {
        let isPass = false;
        let playedCards: Card[] = [];
        let newHandCount = hands[turn as keyof typeof hands].length;

        playedCards = BotAI.getBestMove(hands[turn as keyof typeof hands], isNewRound ? null : centerCombo, isNewRound, isFirstMove);

        if (playedCards.length === 0) {
          isPass = true;
          showMessage(turn, "Bỏ lượt");
        } else {
          if (isFirstMove) setIsFirstMove(false);
          playCardSound();
          setCenterCards(playedCards);
          setLastPlayedTurn(turn);
          
          const playedValues = playedCards.map(c => c.value + '-' + c.suit);
          const newHand = hands[turn as keyof typeof hands].filter(c => !playedValues.includes(c.value + '-' + c.suit));
          setHands(prev => ({ ...prev, [turn]: newHand }));
          newHandCount = newHand.length;

          if (playedCards.length < 4) showMessage(turn, "Chặt!");
        }

        advanceTurnOffline(turn, isPass, newHandCount);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, centerCards, passedPlayers, isOfflineMode]);

  const handlePlay = () => {
    if (selectedIndexes.length === 0 || turn !== 0) return;
    
    const playedCards = selectedIndexes.map(i => myCards[i]);
    const combo = Validator.getCombo(playedCards);
    
    if (combo.type === ComboType.INVALID) {
      alert("Bộ bài không hợp lệ theo luật Tiến Lên!");
      setSelectedIndexes([]);
      return;
    }

    if (!isNewRound && centerCombo && !Validator.canPlay(combo, centerCombo)) {
      alert("Bài của bạn không thể chặt được bài trên bàn!");
      setSelectedIndexes([]);
      return;
    }

    if (isFirstMove) {
      const myHandHas3Spades = myCards.some(c => c.value === 3 && c.suit === 0);
      if (myHandHas3Spades) {
        const has3Spades = playedCards.some(c => c.value === 3 && c.suit === 0);
        if (!has3Spades) {
          alert("Ván đầu tiên BẮT BUỘC phải đánh ra bài chứa lá 3 Bích!");
          return;
        }
      }
    }

    playCardSound();

    if (!isOfflineMode) {
      // ONLINE MULTIPLAYER SOCKET EMIT
      socket.emit('game:play', {
        roomId,
        cards: playedCards.map(c => ({ value: c.value, suit: c.suit }))
      });
      setSelectedIndexes([]);
    } else {
      // OFFLINE PLAY
      if (isFirstMove) setIsFirstMove(false);
      setCenterCards(playedCards);
      const newHand = myCards.filter((_, i) => !selectedIndexes.includes(i));
      setHands(prev => ({ ...prev, 0: newHand }));
      setSelectedIndexes([]);
      setLastPlayedTurn(0);
      advanceTurnOffline(0, false, newHand.length);
    }
  };

  const handlePass = () => {
    if (turn !== 0) return;
    if (isNewRound) {
      alert("Bạn là người mở vòng mới, không được bỏ lượt!");
      return;
    }
    
    if (!isOfflineMode) {
      // ONLINE SOCKET EMIT
      socket.emit('game:pass', { roomId });
      setSelectedIndexes([]);
    } else {
      // OFFLINE PASS
      setSelectedIndexes([]);
      showMessage(0, "Bỏ lượt");
      advanceTurnOffline(0, true, myCards.length);
    }
  };

  const handleStartOnlineGame = () => {
    socket.emit('room:start', { roomId });
  };

  const handleAddBot = () => {
    socket.emit('room:add_bot', { roomId });
  };

  const handleLeaveRoom = () => {
    if (!isOfflineMode && roomId) {
      socket.emit('room:leave', { roomId });
    }
    navigate('/lobby');
  };

  const PlayerAvatar = ({ name, playerIdx, position, isActive = false }: any) => {
    const cardCount = hands[playerIdx]?.length || 0;
    const rank = ranks[playerIdx];
    const rankIcons: any = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '💩' };
    const playerInfo = playersInfo[playerIdx];
    const isBot = playerInfo?.isBot;

    return (
      <div style={{
        position: 'absolute', ...position, display: 'flex', flexDirection: 'column',
        alignItems: 'center', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s'
      }}>
        {messages[playerIdx] && (
          <div className="animate-pop-in" style={{
            position: 'absolute', top: '-40px', background: 'white', color: 'black', 
            padding: '5px 10px', borderRadius: '10px', fontWeight: 'bold', zIndex: 20,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            {messages[playerIdx]}
          </div>
        )}
        <div style={{
          position: 'relative', width: '60px', height: '60px', borderRadius: '50%',
          background: isActive ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)',
          border: isActive ? '3px solid white' : '2px solid rgba(255,255,255,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '2rem', boxShadow: isActive ? '0 0 15px var(--primary-color)' : 'none',
          marginBottom: '5px'
        }}>
          {isBot ? '🤖' : isActive ? '😎' : '👤'}
          {rank && <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: '1.5rem', background: 'white', borderRadius: '50%', padding: '2px' }}>{rankIcons[rank]}</div>}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9rem', color: 'white' }}>
          {name || `Người chơi ${playerIdx + 1}`}
        </div>
        <div style={{ color: '#ffd700', fontSize: '0.8rem', fontWeight: 'bold' }}>
          {cardCount} lá
        </div>
      </div>
    );
  };

  const isHost = !isOfflineMode && roomState && roomState.hostId === userId;
  const isRoomWaiting = !isOfflineMode && roomState && roomState.status === 'WAITING';

  return (
    <div className={isShaking ? 'shake-screen' : ''} style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Visual Combo Effects Overlay */}
      <GameEffects effect={activeEffect} />
      
      {/* Header buttons */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button className="btn btn-secondary" onClick={handleLeaveRoom} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          ⬅ Thoát Sảnh
        </button>
      </div>
      
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', color: 'white' }}>
        {isOfflineMode ? '🤖 Chế độ Offline (Chơi với Bot)' : `🌐 Bàn Online #${roomId}`}
      </div>

      {/* Phòng chờ Online */}
      {isRoomWaiting && (
        <div className="glass-panel animate-pop-in" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          padding: '25px 20px', borderRadius: '20px', zIndex: 100, textAlign: 'center', width: '92%', maxWidth: '450px',
          background: 'rgba(0,0,0,0.92)', border: '2px solid var(--secondary-color)', boxSizing: 'border-box'
        }}>
          <h2 style={{ color: 'var(--secondary-color)', marginBottom: '15px' }}>PHÒNG CHỜ ONLINE (#{roomId})</h2>
          <p style={{ color: '#ccc', marginBottom: '20px' }}>Số người hiện tại: <strong>{playersInfo.length}/4</strong></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
            {playersInfo.map((p, idx) => (
              <div key={p.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <span>{p.isBot ? '🤖' : '👤'} {p.username}</span>
                <span style={{ color: '#2ed573' }}>{p.id === roomState?.hostId ? '👑 Chủ phòng' : 'Sẵn sàng'}</span>
              </div>
            ))}
          </div>

          {isHost ? (
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              {playersInfo.length < 4 && (
                <button className="btn btn-secondary" onClick={handleAddBot} style={{ padding: '10px 20px' }}>
                  🤖 Thêm Bot
                </button>
              )}
              <button className="btn" onClick={handleStartOnlineGame} style={{ padding: '10px 30px', fontSize: '1.2rem', background: 'linear-gradient(45deg, #10b981, #059669)' }}>
                ▶ BẮT ĐẦU GAME
              </button>
            </div>
          ) : (
            <div style={{ color: 'gold', fontStyle: 'italic', fontSize: '1.1rem' }}>
              Đang chờ chủ phòng bắt đầu game...
            </div>
          )}
        </div>
      )}

      {/* Avatars đối thủ tùy theo số lượng người chơi (2, 3 hoặc 4) */}
      {(() => {
        const totalPlayers = playersInfo.length || 4;
        if (totalPlayers === 2) {
          return (
            <PlayerAvatar 
              name={playersInfo[1]?.username || "Đối thủ"} 
              playerIdx={1} 
              position={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }} 
              isActive={turn === 1} 
            />
          );
        }
        if (totalPlayers === 3) {
          return (
            <>
              <PlayerAvatar 
                name={playersInfo[1]?.username || "Người chơi 2"} 
                playerIdx={1} 
                position={{ top: '40%', left: '5%' }} 
                isActive={turn === 1} 
              />
              <PlayerAvatar 
                name={playersInfo[2]?.username || "Người chơi 3"} 
                playerIdx={2} 
                position={{ top: '40%', right: '5%' }} 
                isActive={turn === 2} 
              />
            </>
          );
        }
        return (
          <>
            <PlayerAvatar 
              name={playersInfo[1]?.username || "Player 2"} 
              playerIdx={1} 
              position={{ top: '40%', left: '5%' }} 
              isActive={turn === 1} 
            />
            <PlayerAvatar 
              name={playersInfo[2]?.username || "Player 3"} 
              playerIdx={2} 
              position={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }} 
              isActive={turn === 2} 
            />
            <PlayerAvatar 
              name={playersInfo[3]?.username || "Player 4"} 
              playerIdx={3} 
              position={{ top: '40%', right: '5%' }} 
              isActive={turn === 3} 
            />
          </>
        );
      })()}

      {/* Khu vực giữa bàn */}
      <div style={{
        position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: '500px', height: '260px',
        background: centerCards.length > 0 ? 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)' : 'none',
        borderRadius: '50%', transition: 'background 0.5s ease', zIndex: 40
      }}>
        {centerCards.length === 0 ? (
          <div style={{ 
            opacity: 0.4, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', 
            border: '2px dashed rgba(255,255,255,0.2)', padding: '20px 40px', 
            borderRadius: '20px', background: 'rgba(0,0,0,0.2)' 
          }}>
            Vùng Đánh Bài
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {centerCards.map((c, i) => {
              const total = centerCards.length;
              const angle = (i - (total - 1) / 2) * (total > 5 ? 5 : 8);
              const yOffset = Math.abs(i - (total - 1) / 2) * 3;
              
              return (
                <div 
                  key={i + '-' + centerCards[0].value} 
                  className={`fly-from-${lastPlayedTurn}`}
                  style={{
                    marginLeft: i === 0 ? '0' : '-90px',
                    transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
                    transformOrigin: 'bottom center',
                    zIndex: i,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <CardUI value={c.value} suit={c.suit} style={{ boxShadow: '2px 8px 25px rgba(0,0,0,0.5)' }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {turn === -1 && isDealing && (
        <div className="glass-panel animate-pop-in" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
           <div className="animate-bounce" style={{ fontSize: '6rem', textShadow: '0 0 30px gold' }}>🃏</div>
           <h2 style={{ color: 'white', marginTop: '30px', letterSpacing: '4px', fontSize: '2rem' }}>ĐANG XÀO VÀ CHIA BÀI...</h2>
        </div>
      )}

      {turn === -1 && !isDealing && !isRoomWaiting && (
        <div className="animate-pop-in" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.94)', padding: '20px 18px', borderRadius: '15px', textAlign: 'center', zIndex: 100,
          border: '2px solid gold', width: '92%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 0 30px rgba(255,215,0,0.4)', boxSizing: 'border-box'
        }}>
          <h2 style={{ color: 'gold', marginBottom: '20px', fontSize: '2rem' }}>🏆 VÁN BÀI KẾT THÚC! 🏆</h2>
          
          {penaltyResults.length > 0 && (
            <div style={{ marginBottom: '20px', textAlign: 'left', background: 'rgba(255,255,255,0.08)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.3)' }}>
              <h3 style={{ color: '#ffd700', borderBottom: '1px solid rgba(255,215,0,0.4)', paddingBottom: '8px', marginTop: 0, fontSize: '1.2rem' }}>
                💰 Bảng Thanh Toán Tiền (Luật Tiến Lên Miền Trung):
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px', marginBottom: 0 }}>
                {penaltyResults.map((r: any, idx: number) => {
                  const coins = r.coinChange !== undefined ? r.coinChange : -r.penalty;
                  const isWinner = coins > 0;
                  return (
                    <li key={idx} style={{ marginBottom: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', borderLeft: isWinner ? '4px solid #2ed573' : '4px solid #ff4757' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>
                          {r.username || `Player ${r.player + 1}`} {r.isBot ? '(Bot)' : ''}:
                        </span>
                        <span style={{ color: isWinner ? '#2ed573' : '#ff4757', fontWeight: 'bold', fontSize: '1.15rem' }}>
                          {isWinner ? `+${coins.toLocaleString()} Xu` : `${coins.toLocaleString()} Xu`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#ddd', marginTop: '4px', lineHeight: '1.3' }}>
                        {r.message}
                        {r.newBalance !== null && r.newBalance !== undefined && (
                          <span style={{ color: '#ffd700', marginLeft: '8px', fontWeight: 'bold' }}>
                            [Số dư ví mới: {Number(r.newBalance).toLocaleString()} Xu]
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {(!isOfflineMode && !isHost) ? (
            <div style={{ color: 'gold', fontStyle: 'italic', fontSize: '1.1rem', marginTop: '15px' }}>
              Đang chờ chủ phòng bắt đầu ván mới...
            </div>
          ) : (
            <button className="btn" onClick={() => isOfflineMode ? shuffleAndDealOffline() : handleStartOnlineGame()} style={{ fontSize: '1.2rem', padding: '12px 35px', marginTop: '10px', background: 'linear-gradient(45deg, #10b981, #059669)' }}>
              {isOfflineMode ? 'Chơi Lại Ván Mới' : 'Bắt Đầu Ván Mới (Online)'}
            </button>
          )}
        </div>
      )}

      {turn !== -1 && !isDealing && !isRoomWaiting && (
        <div className="animate-bounce" style={{
          position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%, -50%)',
          color: 'var(--secondary-color)', fontSize: '1.3rem', fontWeight: 'bold', textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          zIndex: 50
        }}>
          {turn === 0 ? "⚡ Tới lượt Bạn!" : `Đang chờ ${playersInfo[turn]?.username || `Player ${turn + 1}`} suy nghĩ...`}
        </div>
      )}

      {/* Khung điều khiển & bài trên tay của người chơi */}
      <div style={{
        position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 100
      }}>
        
        {!isRoomWaiting && (
          <div style={{ 
            display: 'flex', gap: '20px', marginBottom: '45px', 
            opacity: turn === 0 ? 1 : 0.4, 
            pointerEvents: turn === 0 ? 'auto' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <button 
              className="btn btn-secondary" 
              style={{ 
                padding: '12px 32px', fontSize: '1.15rem', fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                boxShadow: turn === 0 ? '0 6px 16px rgba(239, 68, 68, 0.45)' : 'none',
                borderRadius: '12px'
              }} 
              onClick={handlePass}
            >
              🚫 BỎ LƯỢT
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '14px 45px', fontSize: '1.35rem', fontWeight: '900', letterSpacing: '1px',
                background: selectedIndexes.length > 0 
                  ? 'linear-gradient(45deg, #10b981, #059669)' 
                  : 'linear-gradient(45deg, #4b5563, #374151)',
                boxShadow: selectedIndexes.length > 0 
                  ? '0 8px 24px rgba(16, 185, 129, 0.6), 0 0 15px rgba(16, 185, 129, 0.4)' 
                  : 'none',
                borderRadius: '12px',
                transform: selectedIndexes.length > 0 ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} 
              onClick={handlePlay} 
              disabled={selectedIndexes.length === 0}
            >
              🔥 ĐÁNH BÀI
            </button>
          </div>
        )}

        {/* Bài trên tay */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end', 
          minHeight: '220px', padding: '0 20px', width: '100%', maxWidth: '100%', 
          position: 'relative' 
        }}>
          {myCards.map((c, i) => {
            const isPlayable = playableIndices.includes(i);
            const isDisabled = turn !== 0 || !isPlayable;
            const isSelected = selectedIndexes.includes(i);
            const total = myCards.length;
            const mid = (total - 1) / 2;
            const angle = (i - mid) * 4; // Góc xòe quạt
            const yCurve = Math.abs(i - mid) * 2.5; // Đường cong quạt

            return (
              <div key={i + '-' + c.value + c.suit} className={`hand-card-wrapper ${isPlayable && turn === 0 ? 'is-playable' : 'is-disabled'}`} style={{ 
                position: 'relative',
                marginLeft: i === 0 ? '0' : 'var(--card-overlap)',
                zIndex: isSelected ? 100 : i,
                transform: isSelected 
                  ? `translateY(-40px) scale(1.1) rotate(0deg)` 
                  : `translateY(${yCurve}px) rotate(${angle}deg)`,
                transformOrigin: 'bottom center',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <CardUI 
                  value={c.value} 
                  suit={c.suit} 
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onClick={() => toggleSelect(i)}
                  style={{ boxShadow: isSelected ? '0 15px 35px rgba(0,0,0,0.6)' : '2px 5px 15px rgba(0,0,0,0.3)' }}
                />
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '1.2rem', color: turn === 0 ? 'var(--primary-color)' : 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {messages[0] && <span style={{ color: '#e74c3c', marginRight: '10px' }}>[{messages[0]}]</span>}
          {username} (Bạn) {turn === 0 && '😎'}
          {ranks[0] && <span style={{ fontSize: '1.5rem', background: 'white', borderRadius: '50%', padding: '2px' }}>{{1: '🥇', 2: '🥈', 3: '🥉', 4: '💩'}[ranks[0] as number]}</span>}
        </div>
      </div>
    </div>
  );
};

export default GameTable;
