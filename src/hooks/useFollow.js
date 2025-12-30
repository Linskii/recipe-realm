import { useState, useEffect, useCallback } from 'react';
import { followUser, unfollowUser, isFollowing } from '../services/userService.js';

export function useFollow(currentUserId, targetUserId) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUserId || !targetUserId) {
      setLoading(false);
      return;
    }

    const checkFollowingStatus = async () => {
      try {
        setLoading(true);
        const status = await isFollowing(currentUserId, targetUserId);
        setFollowing(status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkFollowingStatus();
  }, [currentUserId, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;

    try {
      if (following) {
        await unfollowUser(currentUserId, targetUserId);
        setFollowing(false);
      } else {
        await followUser(currentUserId, targetUserId);
        setFollowing(true);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to update follow status');
    }
  }, [currentUserId, targetUserId, following]);

  return {
    following,
    loading,
    error,
    toggleFollow,
  };
}
