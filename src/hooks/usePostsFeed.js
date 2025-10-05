import { useState, useRef, useCallback, useEffect } from "react";

// quản lý state bài viết và infinite scroll
export default function usePostsFeed({ postsApi, displayUser, isPersonal, limit = 5 }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);


    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const sentinelRef = useRef(null);

    const fetchNext = useCallback(async () => {
        // Nếu đang load hoặc hết dữ liệu thì thôi
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);
        const page = pageRef.current;

        try {
            const result = await postsApi.getAllPost({
                page,
                limit,
                userId: isPersonal ? displayUser.id : ""
            });

            const list = result.listResult || [];

            console.log(list);

            setPosts((prev) => {
                const existing = new Set(prev.map((p) => p.id));
                const unique = list.filter((p) => !existing.has(p.id));
                return [...prev, ...unique];
            });

            // tăng page nếu có dữ liệu
            if (list.length > 0) {
                pageRef.current = pageRef.current + 1;
            }

            // cập nhật flag hasMore
            hasMoreRef.current = (list.length === limit);
            setHasMore(list.length === limit);


        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    }, [postsApi, limit, isPersonal, displayUser?.id]);    

    useEffect(() => {
        fetchNext();
    }, [fetchNext]);

    useEffect(() => {
        // reset posts khi đổi sang user khác
        setPosts([]);
        pageRef.current = 1;
        hasMoreRef.current = true;

        fetchNext();
    }, [displayUser?.id]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;

        const obs = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    fetchNext();
                }
            },
            { root: null, rootMargin: "300px 0px", threshold: 0 }
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, [fetchNext]);



    return { posts, setPosts, isLoading, hasMore, fetchNext, sentinelRef };
}