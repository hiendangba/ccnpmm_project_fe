import { useEffect, useRef } from "react";
export default function useSocketFeed({ socket, user, isPersonal, setPosts, commentPost, setCommentPost, removeCommentRecursively }) { 
    const commentPostRef = useRef(null);

    useEffect(() => {
        commentPostRef.current = commentPost;
    }, [commentPost]);

    useEffect(() => {
        if (!socket) return;
        // Khi có bài viết mới
        socket.on("USER_UPLOAD_POST", (post) => {
            console.log(post);
            if (post.user.id !== user.id && !isPersonal) {
                setPosts((prev) => [...prev, post]); // thêm bài viết mới vào state của Feed
            }
        });

        // Khi có like/unlike
        socket.on("USER_LIKE", (likeResponseDTO) => {
            console.log(likeResponseDTO);
            setPosts((prev) =>
                prev.map((p) => {
                    if (p.id === likeResponseDTO.postId) {
                        let updatedLikes;
                        if (likeResponseDTO.liked) {
                            // nếu như đó là like  + thêm user vào list
                            const exists = p.likes.some((like) =>
                                String(like.user.id) === String(likeResponseDTO.likeUser.id)
                            );
                            updatedLikes = exists ? p.likes : [...p.likes, { id: likeResponseDTO.id, createdAt: likeResponseDTO.createdAt, user: likeResponseDTO.likeUser }];
                        }
                        else {
                            // nếu như nó là unlike thì xóa ra
                            updatedLikes = p.likes.filter(
                                (like) => String(like.user.id) !== String(likeResponseDTO.likeUser.id)
                            );
                        }
                        return {
                            ...p,
                            likeCount: likeResponseDTO.liked ? p.likeCount + 1 : p.likeCount - 1,
                            likes: updatedLikes,
                        }
                    }
                    return p;
                })
            );
        });

        // Khi có bình luận mới
        socket.on("USER_COMMENT", (commentResponseDTO) => {
            console.log(commentResponseDTO);
            const savedComment = commentResponseDTO;
            if (commentResponseDTO.user.id !== user.id) {
                // Update lại post bên ngoài
                setPosts((prev) =>
                    prev.map((p) => {
                        if (p.id === savedComment.postId) {
                            return {
                                ...p,
                                commentCount: p.commentCount + 1,
                                commentUsers: addCommentToTree(
                                    p.commentUsers ?? [],
                                    savedComment
                                ),
                            };
                        }
                        return p;
                    })
                );

                if (commentPostRef.current && commentPostRef.current.id === savedComment.postId) {
                    // Update model đang mở 
                    setCommentPost((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            commentCount: prev.commentCount + 1,
                            commentUsers: addCommentToTree(
                                prev.commentUsers ?? [],
                                savedComment
                            ),
                        };
                    });
                }
            }

        });

        // KHI XÓA BÌNH LUẬN 
        socket.on("USER_DELETE_COMMENT", (responseDTO) => {
            console.log(responseDTO);
            const deletedComment = responseDTO;
            if (deletedComment.userId !== user.id){
                // update bên ngoài
                setPosts((prevPosts) =>
                    prevPosts.map((post) => {
                        if (post.id !== deletedComment.postId) {
                            return post; // không phải post chứa comment đó
                        }

                        return {
                            ...post,
                            commentCount: post.commentCount - deletedComment.deletedCount,
                            commentUsers: removeCommentRecursively(
                                post.commentUsers || [],
                                deletedComment.commentId
                            ),
                        };
                    })
                );

                if (commentPostRef.current && commentPostRef.current.id === deletedComment.postId) {
                    // Update model đang mở 
                    setCommentPost((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            commentCount: prev.commentCount - deletedComment.deletedCount,
                            commentUsers: removeCommentRecursively(
                                prev.commentUsers || [],
                                deletedComment.commentId
                            ),
                        };
                    });
                }
            }
        })

        return () => {
            socket.off("USER_UPLOAD_POST");
            socket.off("USER_LIKE");
            socket.off("USER_COMMENT");
            socket.off("USER_DELETE_COMMENT");
        };
    }, [socket]);


    const addCommentToTree = (comments, newComment) => {
        if (!newComment.parentCommentId) {
            // comment cấp cao
            return [...comments, newComment];
        }

        // comment reply -> tìm cha
        const addReply = (list) => {
            return list.map(c => {
                if (c.id === newComment.parentCommentId) {
                    return { ...c, childs: [...(c.childs ?? []), newComment] };
                }
                if (c.childs?.length) {
                    return { ...c, childs: addReply(c.childs) };
                }
                return c;
            });
        };

        return addReply(comments);
    };


    return { commentPostRef, addCommentToTree };
}